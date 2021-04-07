// reader.readAsDataURL(this.files[0]);

function extractAudio() {
	/** @var {HTMLAudioElement} */
	let audioDOM = document.getElementById("audio1");
	// audioDOM.play();
	// audioDOM.addEventListener('')
	// (new HTMLAudioElement())
	audioDOM.addEventListener('loadeddata', e=> console.log(e))
	audioDOM.play();
	console.log(audioDOM.loadedmetadata);
	console.log(audioDOM.loadeddata);
	console.log(audioDOM.data);
	console.log(audioDOM);
	console.log(audioDOM.audioTracks);
	console.log(audioDOM.duration);
	console.log(audioDOM.buffered);
	console.log(audioDOM.frameBuffer);
	// processS
	// console.log(audioDOM.createBufferSource());
	// console.log(this);
	// console.log(this.files);

	let fileReader = new FileReader();
	// let arrayBuffer = await e.target.audioBlob.arrayBuffer();
	
	// console.log("audioContext:", audioContext);
	
	fileReader.onloadend = () => {
		let arrayBuffer = fileReader.result;
		console.log("arrayBuffer:", arrayBuffer);
		audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {

			console.log("audioBuffer:", audioBuffer);
			
			let source = audioContext.createBufferSource();
			source.buffer = audioBuffer;
			// if (!source.start)
			// 	source.start = source.noteOn;
			
			var gainNode = audioContext.createGain();
			gainNode.gain.value = 1;
			source.connect(gainNode);
			gainNode.connect(audioContext.destination);
			console.log("Destination: ", audioContext.destination);
			console.log("channelCount: ", audioContext.destination.channelCount);
			console.log("channelCountMode: ", audioContext.destination.channelCountMode);
			console.log("channelInterpretation: ", audioContext.destination.channelInterpretation);
			console.log("maxChannelCount: ", audioContext.destination.maxChannelCount);
			console.log("numberOfInputs: ", audioContext.destination.numberOfInputs);
			console.log("numberOfOutputs: ", audioContext.destination.numberOfOutputs);
			
			// source.buffer.getChannelData(0);

			// audioReplay.audioSource = source;
			source.onended = () => {
				console.log("Stopping source2");
				audioReplay.playing = false;
			};

			console.log("Playing source");
			console.log(source.buffer.getChannelData(0));
			if (source.start)
				source.start(0);
			else if (source.noteOn) // mobile
				source.noteOn(0);
			console.log("Started source");
			e.target.playing = true;
			lastSource = source;
		}, (e) => {
			console.error("Error Decoding Audio: ", e);
		});
	}
	fileReader.readAsText(audioDOM);
}
function extractAudioFromFile(file) {

}