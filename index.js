function onOpenCvReady() {
	document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

const UPDATE_FREQUENCY = 500;
async function startRecordingAudio(chart) {
	let microphonePermissions = navigator.permissions.query({name:'microphone'});
	if (microphonePermissions.state == 'denied') {
		console.error("Blocked from accessing audio input. Please consider changing microphone permissions.")
		return {successful: false};
	}

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
		// console.error("Could not access audio input.");
		return {successful: false};
	}


	const audioContext = new AudioContext();
	const source = audioContext.createMediaStreamSource(stream);
	const processor = audioContext.createScriptProcessor(1024, 1, 1);

	let audioChunks = [];

	processor.onaudioprocess = (e) => {
		console.log(e);
		let audioBuffer = e.inputBuffer;
		// audioChunks.push(audioBuffer);
		// console.log(audioBuffer)[i];
		// let audioBufferCopy = new AudioBuffer({length: audioBuffer.length, sampleRate: audioBuffer.sampleRate});
		let audioChannel = new Float32Array(new Array(audioBuffer.length));
		audioBuffer.copyFromChannel(audioChannel, 0);
		// audioBuffer.copyToChannel(audioChannelCopy, 0);
		// let channelData = audioBuffer.getChannelData(0);
		console.log(audioChannel);
		let labelInd = parseInt(chart.data.labels[chart.data.labels.length - 1]);
		chart.data.datasets.forEach((dataset) => { dataset.data = []; });
		for (let i = 0; i < 100; ++i) {
			// chart.data.labels.push(labelInd + i);
			chart.data.datasets.forEach((dataset) => {
				dataset.data.push(audioChannel[i]);
			});
		}
		chart.update();
		// audioChunks.push(audioChannel);
	};

	/** @type{MediaRecorder} */
	const mediaRecorder = await new MediaRecorder(stream);
	console.log(mediaRecorder);

	
	// const audioChunks = [];
	
	mediaRecorder.addEventListener("dataavailable", (e) => {
		audioChunks.push(e.data); // push audio Blob
	});


	// 	// chart.data.labels.shift();
	// 	// chart.data.datasets.forEach((dataset) => {
	// 	// 	dataset.data.shift();
	// 	// });
		
	// });

	mediaRecorder.addEventListener("stop", async () => {
		const audioBlob = new Blob(audioChunks);
		console.log(audioBlob);

		const audioUrl = URL.createObjectURL(audioBlob);
		const audio = new Audio(audioUrl);
		console.log(audio);
		audio.play();
	});

	mediaRecorder.start();
	source.connect(processor);
	processor.connect(audioContext.destination);
	// return {
	// 	successful: true,
	// 	exec: () => {
	// 		clearInterval(updateInterval);
	// 		mediaRecorder.stop();
	// 		mediaRecorder.stream.getAudioTracks().forEach((track) => {
	// 			track.stop();
	// 		});
	// 		return audioChunks;
	// 	}
	// };
	return {
		successful: true,
		exec: () => {
			// clearInterval(updateInterval);
			mediaRecorder.stop();
			stream.getAudioTracks().forEach((track) => {
				track.stop();
			});
			processor.disconnect();


			// const audioBlob = new Blob(audioChunks);
			// const audioUrl = URL.createObjectURL(audioBlob);
			// const audio = new Audio(audioUrl);
			// console.log(audio);
			// audio.play();

			// console.log("STOPPING!");
			// console.log(audioChunks);

			return audioChunks;
		}
	};
}

async function audioChange(e) {
	let audioControl = e.target;
	if (audioControl.mediaStop !== undefined) {
		audioControl.mediaStop();
		audioControl.mediaStop = undefined;
		audioControl.textContent = "Start";
	}
	else {
		let result = await startRecordingAudio(audioControl.chart);
		if (result.successful) {
			console.log(result);
			audioControl.mediaStop = result.exec;
			audioControl.textContent = "Stop";
		}
		else {
			let childNodes = audioControl.parentNode.childNodes;
			for (let i = 0; i < childNodes.length; ++i) {
				if (childNodes[i].className == "warning") {
					return;
				}
			}
			warningStr = "Unable to contact to audio. Please ensure a microphone is connected and permissions are enabled.";
			let warning = document.createElement('span');
			warning.className = "warning";
			warning.textContent = warningStr;
			audioControl.parentNode.appendChild(warning);
		}
	}
}