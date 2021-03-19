async function audioChange(e) {
	let audioControl = e.target;
	let chart = audioControl.chart;
	if (audioControl.textContent === "Stop") {
		audioControl.audioRecorder.stop();
		audioControl.textContent = "Start";
	}
	else {
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
				const audioUrl = URL.createObjectURL(audioBlob);
				const audio = new Audio(audioUrl);
				console.log(audio);
				audio.play();
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