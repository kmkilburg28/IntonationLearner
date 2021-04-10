let isUnlocked = false;
const AudioContext = window.AudioContext || window.webkitAudioContext; 
/** @type {AudioContext} */
const audioContext = new AudioContext();
function unlock() {
			
	// if(isIOS || this.unlocked)
	if(isUnlocked)
		return;

	// create empty buffer and play it
	let buffer = audioContext.createBuffer(1, 1, 22050);
	let source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.destination);
	if (source.start)
		source.start(0);
	else if (source.noteOn) // mobile
		source.noteOn(0);

	// by checking the play state after some time, we know if we're really unlocked
	setTimeout(function() {
		if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
			isUnlocked = true;
		}
	}, 0);

}

async function recordAudio(e) {
	/** @type {HTMLButtonElement} */
	const audioControl = e.target;
	const chart = audioControl.chart;
	let lastSample = new Float32Array(2048);
	const audioRecorder = new AudioRecorder({
		onAudioStart: () => {
			audioControl.removeEventListener('click', recordAudio);
			audioControl.addEventListener('click', () => {
				audioRecorder.stop();
			});
			audioControl.textContent = "Stop Recording";
		},
		onAudioUpdate: (audioData, sampleRate) => {

			console.log(audioData)
			let frequencesData;
			chart.data.datasets.forEach((dataset) => {
				if (dataset.label == "User") {
					frequencesData = dataset.data;
				}
			});

			const WINDOW_SIZE = 2048;
			const INCREMENT = 256;

			const OVERLAP = WINDOW_SIZE - INCREMENT;
			for (let i = INCREMENT; i <= WINDOW_SIZE; i += INCREMENT) {
				let oldSection = lastSample.subarray(i);
				let newSection = audioData.subarray(0, i);
				console.log(i, oldSection.length, newSection.length);
				let joinedSection = new Float32Array(WINDOW_SIZE);
				joinedSection.set(oldSection);
				joinedSection.set(newSection, oldSection.length);
				let frequency = getFrequency(joinedSection, sampleRate);
				frequencesData.push(frequency);
				if (frequencesData.length > chart.data.labels.length)
					frequencesData.shift();
				chart.update();
			}

			// for (let i = 0; i <= audioData.length-WINDOW_SIZE; i += INCREMENT) {
			// 	let subSection = audioData.subarray(i, i+WINDOW_SIZE);
			// 	let frequency = getFrequency(subSection, sampleRate);
			// 	frequencesData.push(frequency);
			// 	if (frequencesData.length > chart.data.labels.length)
			// 		frequencesData.shift();
			// }

			let frequency = getFrequency(audioData, sampleRate);
			frequencesData.push(frequency);
			if (frequencesData.length > chart.data.labels.length)
				frequencesData.shift();

			lastSample = audioData;
		},
		onAudioStop: (audioBlob) => {
			audioControl.textContent = "Reset";
			audioControl.addEventListener('click', () => {
				window.location.reload();
			});
			let continueButton = document.getElementById("continueButton");
			if (!continueButton) {
				continueButton = document.createElement("button");
				continueButton.textContent = "Continue";
				continueButton.addEventListener('click', () => document.location='evalation.html');
				audioControl.parentElement.appendChild(continueButton);
			}

			let audioUrl;
			try {
				audioUrl = webkitURL.createObjectURL(audioBlob);
			}
			catch(err) { // Firefox
				audioUrl = URL.createObjectURL(audioBlob);
			}
			console.log(audioUrl);
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