class AudioRecorder {
	/**
	 * 
	 * @param {{
	 * 	onAudioStart: function,
	 * 	onPermissionsFail: function,
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
		 * 	mediaRecorder: MediaRecorder,
		 * 	interval: number
		 * }}
		 */
		this.trackedObjects = {
			mediaRecorder: undefined,
			interval: undefined
		};
		this.INTERVAL_TIMER = 100;
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
		if (this.trackedObjects.interval)
			clearInterval(this.trackedObjects.interval);
		if (this.trackedObjects.mediaRecorder)
			this.trackedObjects.mediaRecorder.stop();
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
		/** @type{MediaRecorder} */
		const mediaRecorder = await new MediaRecorder(stream);			
		mediaRecorder.addEventListener("dataavailable", (e) => this.onDataAvailableRecorder(e));
		mediaRecorder.addEventListener("stop", (e) => this.onStopMediaRecorder(e));

		mediaRecorder.start();

		if (this.callbacks.onDataAvailable) {
			this.trackedObjects.interval = setInterval(() => {
				this.trackedObjects.mediaRecorder.requestData();
			}, this.INTERVAL_TIMER);
		}

		this.trackedObjects.mediaRecorder = mediaRecorder;

		return true;
	}

	async onDataAvailableRecorder(e) {
		this.audioBlobs.push(e.data); // push audio Blob
		if (this.callbacks.onDataAvailable) {
			const audioBlob = new Blob(this.audioBlobs, { type : 'audio/wav; codecs=0' });
			this.callbacks.onDataAvailable(audioBlob);
		}
	}
	async onStopMediaRecorder(e) {
		const audioBlob = new Blob(this.audioBlobs, { type : 'audio/wav; codecs=0' });
		if (this.callbacks.onAudioStop)
			this.callbacks.onAudioStop(audioBlob);
	}
}