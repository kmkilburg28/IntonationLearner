async function audioChange(e) {
	let audioControl = e.target;
	let chart = audioControl.chart;
	if (audioControl.textContent === "Stop") {
		audioControl.audioRecorder.stop();
	}
	else {
		let audioReplay = document.getElementById('audioReplay');
		let lastSource = undefined;
		audioReplay.addEventListener('click', async (e) => {
			if (lastSource) {
				lastSource.stop();
				lastSource = undefined;
			}
			if (e.target.audioBlob) {
				console.log("Attempting to replay!!");
				let fileReader = new FileReader();
				// let arrayBuffer = await e.target.audioBlob.arrayBuffer();
				fileReader.onloadend = () => {
					let arrayBuffer = fileReader.result;
					console.log("arrayBuffer:", arrayBuffer);
					const AudioContext = window.AudioContext || window.webkitAudioContext; 
					/** @type {AudioContext} */
					const audioContext = new AudioContext();
					audioContext.resume();
					console.log("audioContext:", audioContext);
					audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {

						console.log("audioBuffer:", audioBuffer);
						
						let source = audioContext.createBufferSource();
						source.buffer = audioBuffer;
						if (!source.start)
							source.start = source.noteOn;
						
						var gainNode = audioContext.createGain()
						gainNode.gain.value = 1
						source.connect(gainNode)
						gainNode.connect(audioContext.destination)
						
						lastSource = source;
						console.log("Start source");
						source.start(0);
						console.log("Source Started");
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

				// const audioUrl = URL.createObjectURL(audioBlob);
				// const Audio = window.Audio || window.webkitAudio;
				// const audio = new Audio(audioUrl);
				
				// audioReplay.audio = audio;
				audioReplay.audioBlob = audioBlob;
				audioReplay.disabled = false;
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