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
		console.log("Requesting Stream");
		await this.requestStream();
		console.log("Tracked Objects", this.trackedObjects);
		console.log("Got stream", this.trackedObjects.stream);
		if (this.trackedObjects.stream) {
			let startRecording = this.startRecordings(this.trackedObjects.stream);
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
			console.log(stream.getTracks());
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
		console.log("Creating auioContext for stream with processor");
		const audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(stream);
		const processor = audioContext.createScriptProcessor(1024, 1, 1);
		processor.onaudioprocess = (e) => this.onAudioUpdate(e);
	
		/** @type{MediaRecorder} */
		console.log("Awaiting MediaRecorder");
		const mediaRecorder = await new MediaRecorder(stream);			
		console.log("MediaRecorder:");
		console.log(mediaRecorder);
		mediaRecorder.addEventListener("dataavailable", (e) => this.onDataAvailableRecorder(e));
		mediaRecorder.addEventListener("stop", (e) => this.onStopMediaRecorder(e));

		console.log("Connecting Processor");
		source.connect(processor);
		processor.connect(audioContext.destination);
		console.log("Starting MediaRecorder");
		mediaRecorder.start();
		
		this.trackedObjects.processor = processor;
		this.trackedObjects.mediaRecorder = mediaRecorder;

		return true;
	}

	/**
	 * @param {AudioProcessingEvent} e 
	 */
	async onAudioUpdate(e) {
		console.log("onAudioUpdate!!!");
		console.log(e);
		let audioBuffer = e.inputBuffer;
		let audioChannel = new Float32Array(new Array(audioBuffer.length));
		audioBuffer.copyFromChannel(audioChannel, 0);
		if (this.callbacks.onAudioUpdate)
			this.callbacks.onAudioUpdate(audioChannel);
	}

	async onDataAvailableRecorder(e) {
		console.log("onDataAvailableRecorder!!!");
		this.audioBlobs.push(e.data); // push audio Blob
	}
	async onStopMediaRecorder(e) {
		console.log("onStopMediaRecorder!!!");
		const audioBlob = new Blob(this.audioBlobs);
		if (this.callbacks.onAudioStop)
			this.callbacks.onAudioStop(audioBlob);
	}
}