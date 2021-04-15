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

	// Frequency filtering variables
	let lastFrequencyTime = 0;
	let lastFrequency = 0;
	const JUMP_THRESHOLD = 100;
	const JUMP_TIME_LIMIT = 10;
	const LOW_FREQUENCY_THRESHOLD = 50;
	const HIGH_FREQUENCY_THRESHOLD = 500;

	let nextWindowStart = 0;

	const audioRecorder = new AudioRecorder({
		onAudioStart: () => {
			audioControl.removeEventListener('click', recordAudio);
			audioControl.addEventListener('click', () => {
				audioRecorder.stop();
			});
			audioControl.textContent = "Stop Recording";
		},
		onDataAvailable: (audioBlob) => {
			let fileReader = new FileReader();
			fileReader.onloadend = () => {
				let arrayBuffer = fileReader.result;
				audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
					let rawData = parseAudioBuffer(audioBuffer);
				
					let frequencesData;
					chart.data.datasets.forEach((dataset) => {
						if (dataset.label == "User") {
							frequencesData = dataset.data;
						}
					});

					const WINDOW_SIZE = 2048;
					const INCREMENT = 512;
					// const OVERLAP = WINDOW_SIZE - INCREMENT;
					const newFrequencesLength = Math.ceil((rawData.buffer.length - WINDOW_SIZE - nextWindowStart) / INCREMENT);
					const newFrequences = new Float32Array(newFrequencesLength);
					const FULL_BATCH_SIZE = 4;
					let batchSize = FULL_BATCH_SIZE < newFrequencesLength ? FULL_BATCH_SIZE : newFrequencesLength;
					let threadsStarted = 0;
					let threadsLeft = batchSize;
					let frequencyInd = 0;
					console.log(newFrequencesLength);
					for (/* nextWindowStart */; nextWindowStart < rawData.buffer.length; nextWindowStart += INCREMENT) {
						if (rawData.buffer.length - nextWindowStart < WINDOW_SIZE) {
							break;
						}
						frequencyInd++;

						let frequencyThread = async (freqInd, start, end, sampleRate) => {
							let strippedRaws = rawData.buffer.slice(start, end);
							let frequency = getFrequency(strippedRaws, sampleRate, YIN_THRESHOLD_USER);
							newFrequences[freqInd] = frequency;
							threadsLeft--;
						};

						frequencyThread(frequencyInd, nextWindowStart, nextWindowStart + WINDOW_SIZE, rawData.sampleRate);
						threadsStarted++;

						if (threadsStarted == batchSize) {
							for (let i = batchSize; i < frequencesData.length; ++i) {
								frequencesData[i-batchSize-1] = frequencesData[i];
							}
							threadsStarted = 0;
							while (threadsLeft > 0) {console.log(threadsLeft + " threads left")}

							for (let i = 0; i < batchSize; ++i) {

								let frequency = newFrequences[frequencyInd-batchSize+i];
								// Clean frequency
								if (frequency < LOW_FREQUENCY_THRESHOLD || HIGH_FREQUENCY_THRESHOLD < frequency ||
									(Math.abs(frequency - lastFrequency) > JUMP_THRESHOLD && (frequencesData.length - 1) - lastFrequencyTime < JUMP_TIME_LIMIT)) {
									frequency = 0;
									--lastFrequencyTime;
								}
								else {
									lastFrequencyTime = frequencesData.length - 1;
									lastFrequency = frequency;
								}
								frequencesData[frequencesData.length-batchSize+i-1] = frequency;
								frequencesData[frequencesData.length-batchSize+i] = frequency;
							}

							batchSize = FULL_BATCH_SIZE < newFrequencesLength - frequencyInd ? FULL_BATCH_SIZE : newFrequencesLength - frequencyInd;
							threadsLeft = batchSize;
							console.log("Batch: ", frequencyInd / FULL_BATCH_SIZE);
							(async () => chart.update())();
						}
					}
					// let SplineArray = getSplineFromArray(frequencesData);
					// plotSpline(SplineArray, chart, "UserSmooth");
				});
			}
			fileReader.readAsArrayBuffer(audioBlob);
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
				continueButton.addEventListener('click', () => document.location='results.html');
				audioControl.parentElement.appendChild(continueButton);
			}

			let fileReader = new FileReader();
			fileReader.onloadend = () => {
				let arrayBuffer = fileReader.result;
				audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
					let rawData = parseAudioBuffer(audioBuffer);
					localStorage.removeItem("userRecording");
					try {
						localStorage.setItem("userRecording", LZString.compress(JSON.stringify(rawData)));
					}
					catch (e) {
						alert("Audio recording was too long. Please reset and try again.");
						continueButton.disabled = true;
					}
				});
			}
			fileReader.readAsArrayBuffer(audioBlob);
			const params = new URLSearchParams(window.location.search);
			localStorage.removeItem('modelfile');
			localStorage.setItem('modelfile', params.get('modelfile'));
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