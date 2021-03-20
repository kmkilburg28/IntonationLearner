async function audioChange(e) {
	let audioControl = e.target;
	let chart = audioControl.chart;
	if (audioControl.textContent === "Stop") {
		audioControl.audioRecorder.stop();
	}
	else {
		let audioReplay = document.getElementById('audioReplay');
		let audioReplaySound = document.getElementById('audioReplaySound');
		let lastSource = undefined;
		audioReplay.addEventListener('click', (e) => {
			audioReplaySound.play();
		});
		// audioReplay.addEventListener('click', async (e) => {
		// 	if (e.target.playing) {
		// 		console.log("Stopping source");
		// 		lastSource.stop();
		// 		e.target.playing = false;
		// 		lastSource = undefined;
		// 	}
		// 	if (e.target.audioSource) {
		// 		console.log("Playing source");
		// 		e.target.audioSource.start(0);
		// 		e.target.playing = true;
		// 		lastSource = e.target.audioSorce;
		// 	}
		// });
		const audioRecorder = new AudioRecorder({
			onAudioStart: () => {
				audioControl.textContent = "Stop";
			},
			onAudioUpdate: (audioData) => {
				let labelInd = parseInt(chart.data.labels[chart.data.labels.length - 1]);
				chart.data.datasets.forEach((dataset) => { dataset.data = []; });
				for (let i = 0; i < 200; ++i) {
					// chart.data.labels.push(labelInd + i);
					chart.data.datasets.forEach((dataset) => {
						dataset.data.push(audioData[i]);
					});
				}
				chart.update();
			},
			onAudioStop: (audioBlob) => {
				audioControl.textContent = "Start";

				const audioUrl = URL.createObjectURL(audioBlob);
				audioReplaySound.src = audioUrl;
				audioReplay.disabled = false;
				// const Audio = window.Audio || window.webkitAudio;
				// const audio = new Audio(audioUrl);

				// console.log(audio);
				// audioControl.parentNode.appendChild(audio);
				console.log(audioControl.parentNode.childNodes);
				
				// // audioReplay.audio = audio;
				// audioReplay.disabled = false;

				// let fileReader = new FileReader();
				// // let arrayBuffer = await e.target.audioBlob.arrayBuffer();
				// const AudioContext = window.AudioContext || window.webkitAudioContext; 
				// /** @type {AudioContext} */
				// const audioContext = new AudioContext();
				// console.log("audioContext:", audioContext);
				
				// fileReader.onloadend = () => {
				// 	let arrayBuffer = fileReader.result;
				// 	console.log("arrayBuffer:", arrayBuffer);
				// 	audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {

				// 		console.log("audioBuffer:", audioBuffer);
						
				// 		let source = audioContext.createBufferSource();
				// 		source.buffer = audioBuffer;
				// 		if (!source.start)
				// 			source.start = source.noteOn;
						
				// 		var gainNode = audioContext.createGain();
				// 		gainNode.gain.value = 1;
				// 		source.connect(gainNode);
				// 		gainNode.connect(audioContext.destination);
						
				// 		lastSource = source;

				// 		audioReplay.audioSource = source;
				// 		source.onended = () => {
				// 			audioReplay.playing = false;
				// 		};
				// 	}, (e) => {
				// 		console.error("Error Decoding Audio: ", e);
				// 	});
				// }
				// fileReader.readAsArrayBuffer(audioBlob);
			},
			onPermissionsFail: () => {
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
		});
		audioRecorder.start();
		audioControl.audioRecorder = audioRecorder;
	}
}