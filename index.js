async function audioChange(e) {
	let audioControl = e.target;
	let chart = audioControl.chart;
	if (audioControl.textContent === "Stop") {
		audioControl.audioRecorder.stop();
	}
	else {
		let audioReplay = document.getElementById('audioReplay');
		let audioReplaySound = document.getElementById('audioReplaySound');
		// audioReplay.addEventListener('click', (e) => {
		// 	audioReplaySound.play();
		// });
		let lastSource = undefined;
		audioReplay.addEventListener('click', async (e) => {
			if (e.target.playing) {
				console.log("Stopping source1");
				lastSource.stop();
				e.target.playing = false;
				lastSource = undefined;
			}
			if (e.target.audioBlob) {
				let fileReader = new FileReader();
				// let arrayBuffer = await e.target.audioBlob.arrayBuffer();
				const AudioContext = window.AudioContext || window.webkitAudioContext; 
				/** @type {AudioContext} */
				const audioContext = new AudioContext();
				console.log("audioContext:", audioContext);
				
				fileReader.onloadend = () => {
					let arrayBuffer = fileReader.result;
					console.log("arrayBuffer:", arrayBuffer);
					audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {

						console.log("audioBuffer:", audioBuffer);
						
						let source = audioContext.createBufferSource();
						source.buffer = audioBuffer;
						if (!source.start)
							source.start = source.noteOn;
						
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

						audioReplay.audioSource = source;
						source.onended = () => {
							console.log("Stopping source2");
							audioReplay.playing = false;
						};

						console.log("Playing source");
						console.log(e.target.audioSource.buffer.getChannelData(0));
						e.target.audioSource.start(0);
						console.log("Started source");
						e.target.playing = true;
						lastSource = e.target.audioSorce;
					}, (e) => {
						console.error("Error Decoding Audio: ", e);
					});
				}
				fileReader.readAsArrayBuffer(e.target.audioBlob);

				
			}
		});
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

				let audioUrl;
				try {
					audioUrl = webkitURL.createObjectURL(audioBlob);
				}
				catch(err) { // Firefox
					audioUrl = URL.createObjectURL(audioBlob);
				}
				console.log(audioUrl);

				// audioPlaying.audioSource
				// audioReplay.playing = false;

				audioReplaySound.src = audioUrl;
				// console.log(audioReplay.parentNode.childNodes);
				audioReplay.disabled = false;
				// audioReplaySound.play();
				// const Audio = window.Audio || window.webkitAudio;
				// const audio = new Audio(audioUrl);
				// audio.play();

				// console.log(audio);
				// audioReplay.parentNode.appendChild(audio);
				// console.log(audioReplay.parentNode.childNodes);
				
				// // audioReplay.audio = audio;
				// audioReplay.disabled = false;
				audioReplay.audioBlob = audioBlob;

				
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