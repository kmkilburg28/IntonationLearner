class AudioRecorder {
	/**
	 * 
	 * @param {{
	 * 	onAudioStart: function,
	 * 	onPermissionsFail: function,
	 * 	onAudioUpdate: function(Float32Array),
	 * 	onAudioStop: function(Blob)
	 * }} callbacks 
	 */
	constructor(callbacks) {
		this.audioBlobs = [];
		this.callbacks = callbacks;
		/**
		 * @type {{
		 * 	stream: MediaStream,
		 * 	processor: ScriptProcessorNode,
		 * 	mediaRecorder: MediaRecorder
		 * }}
		 */
		this.trackedObjects = {
			stream: undefined,
			processor: undefined,
			mediaRecorder: undefined
		};
	}

	/**
	 * 
	 * @param {string} callbackName 
	 * @param {function} callbackFunction 
	 */
	addCallback(callbackName, callbackFunction) {
		this.callbacks[callbackName] = callbackFunction;
	}

	async start() {
		await this.requestStream();
		if (this.trackedObjects.stream) {
			let startRecording = await this.startRecordings(this.trackedObjects.stream);
			if (startRecording)
				this.callbacks.onAudioStart();
		}
	}

	async stop() {
		if (this.trackedObjects.mediaRecorder)
			this.trackedObjects.mediaRecorder.stop();
		if (this.trackedObjects.stream) {
			this.trackedObjects.stream.getAudioTracks().forEach((track) => {
				track.stop();
			});
		}
		if (this.trackedObjects.processor)
			this.trackedObjects.processor.disconnect();
	}


	async requestStream() {
		if (this.trackedObjects.stream) return;
		
		// let microphonePermissions = await navigator.permissions.query({name:'microphone'});
		// if (microphonePermissions.state == 'denied') {
		// 	console.error("Blocked from accessing audio input. Please consider changing microphone permissions.");
		// 	if (this.callbacks.onPermissionsFail)
		// 		this.callbacks.onPermissionsFail();
		// 	return;
		// }
	
		// Request audio stream
		let stream 
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			});
		}
		catch (e) {
			console.error(e + " – Could not access audio input.");
			if (this.callbacks.onPermissionsFail)
				this.callbacks.onPermissionsFail();
			return;
		}

		this.trackedObjects.stream = stream;
	}
	async startRecordings(stream) {
		const AudioContext = window.AudioContext || window.webkitAudioContext; 
		const audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(stream);
		const gainNode = audioContext.createGain();
		gainNode.gain.value = 8;
		source.connect(gainNode);
		const WINDOW_SIZE = 2048; // 2048 - down to 43 Hz; 1024 - down to 86 Hz
		const processor = audioContext.createScriptProcessor(WINDOW_SIZE, 1, 1);
		processor.onaudioprocess = (e) => this.onAudioUpdate(e);
	
		/** @type{MediaRecorder} */
		const mediaRecorder = await new MediaRecorder(stream);			
		mediaRecorder.addEventListener("dataavailable", (e) => this.onDataAvailableRecorder(e));
		mediaRecorder.addEventListener("stop", (e) => this.onStopMediaRecorder(e));

		source.connect(processor);
		processor.connect(audioContext.destination);
		mediaRecorder.start();
		
		this.trackedObjects.processor = processor;
		this.trackedObjects.mediaRecorder = mediaRecorder;

		return true;
	}

	/**
	 * @param {AudioProcessingEvent} e 
	 */
	async onAudioUpdate(e) {
		let audioBuffer = e.inputBuffer;
		let audioChannel = new Float32Array(new Array(audioBuffer.length));
		// audioBuffer.copyFromChannel(audioChannel, 0);

		let audioChannelRef = audioBuffer.getChannelData(0);
		for (let i = 0; i < audioChannel.length; ++i) {
			audioChannel[i] = audioChannelRef[i];
		}
		if (this.callbacks.onAudioUpdate)
			this.callbacks.onAudioUpdate(audioChannel, audioBuffer.sampleRate);
	}

	async onDataAvailableRecorder(e) {
		this.audioBlobs.push(e.data); // push audio Blob
	}
	async onStopMediaRecorder(e) {
		const audioBlob = new Blob(this.audioBlobs, { type : 'audio/wav; codecs=0' });
		if (this.callbacks.onAudioStop)
			this.callbacks.onAudioStop(audioBlob);
	}
}