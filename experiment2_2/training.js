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

	// Frequency filtering variables
	let lastFrequencyTime = 0;
	let lastFrequency = 0;
	const JUMP_THRESHOLD = 100;
	const JUMP_TIME_LIMIT = 10;
	const LOW_FREQUENCY_THRESHOLD = 50;
	const HIGH_FREQUENCY_THRESHOLD = 500;

	let nextWindowStart = 0;

	let stopFunction = () => {};

	const audioRecorder = new AudioRecorder({
		onAudioStart: () => {
			audioControl.removeEventListener('click', recordAudio);
			stopFunction = () => {
				audioRecorder.stop();
				audioRecorder.removeEventListener('click', stopFunction);
			};
			audioControl.addEventListener('click', stopFunction);
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
					if (newFrequencesLength <= 0) {
						return false;
					}
					const newFrequences = new Float32Array(newFrequencesLength);
					const FULL_BATCH_SIZE = 4;
					let batchSize = FULL_BATCH_SIZE < newFrequencesLength ? FULL_BATCH_SIZE : newFrequencesLength;
					let threadsStarted = 0;
					let threadsLeft = batchSize;
					let frequencyInd = 0;
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
							// while (threadsLeft > 0) {console.log(threadsLeft + " threads left")}

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
							// console.log("Batch: ", frequencyInd / FULL_BATCH_SIZE);
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
			audioControl.addEventListener('click', () => document.location.reload());
			let continueButton = document.getElementById("continueButton");
			if (!continueButton) {
				continueButton = document.createElement("button");
				continueButton.textContent = "Continue";
				continueButton.addEventListener('click', () => {
					let lastTrialId = localStorage.getItem('lastTrialId');
					if (lastTrialId == null)
						lastTrialId = 0;
					localStorage.setItem('lastTrialId', parseInt(lastTrialId) + 1);
					document.location='results.html'
				});
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


async function recordAudioTest(e) {
	/** @type {HTMLButtonElement} */
	const audioControl = e.target;

	let stopFunction = () => {};

	const audioRecorder = new AudioRecorder({
		onAudioStart: () => {
			audioControl.removeEventListener('click', recordAudioTest);
			stopFunction = () => {
				audioRecorder.stop();
				audioControl.removeEventListener('click', stopFunction);
			};
			audioControl.addEventListener('click', stopFunction);
			audioControl.textContent = audioControl.textContent.split(':')[0] + ": Stop Recording";
		},
		onAudioStop: async (audioBlob) => {
			audioControl.textContent = "Reset";
			audioControl.addEventListener('click', () => document.location.reload());
			const modelAudioData = audioControl.modelAudioData;

			let frequenciesUser = undefined;
			let fileReader = new FileReader();
			fileReader.onloadend = () => {
				let arrayBuffer = fileReader.result;
				audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
					const rawData = parseAudioBuffer(audioBuffer);
					frequenciesUser = getFrequencies(rawData);
				});
			}
			fileReader.readAsArrayBuffer(audioBlob);
			let frequenciesModel = await (async () => {
				const audioBuffer = await loadAudioFile(modelAudioData.location);
				const rawData = parseAudioBuffer(audioBuffer);
				const frequenciesModel = getFrequencies(rawData);
				return frequenciesModel;
			})();


			let submitButton = document.getElementById(audioControl.id + "-submitButton");
			if (!submitButton) {
				submitButton = document.createElement("button");
				submitButton.id = audioControl.id + "-submitButton";
				submitButton.textContent = "Submit";
				submitButton.addEventListener('click', () => {
					if (frequenciesModel == undefined || frequenciesUser == undefined)
						return;
					submitButton.disabled = true;
					let lastTrialId = localStorage.getItem('lastTrialId');
					if (lastTrialId == null)
						lastTrialId = 0;
					localStorage.setItem('lastTrialId', parseInt(lastTrialId) + 1);
					console.log(modelAudioData)
					localStorage.setItem('modelLabel', modelAudioData.label);
					
					console.log(frequenciesModel, frequenciesUser);
					const normalizedModelAndUser = normalizeFrequencyArray(frequenciesModel.buffer, frequenciesUser.buffer);
					const coAndMSE = getCoAndMSE(normalizedModelAndUser.normalized1, normalizedModelAndUser.normalized2);
					
					attemptCreateTrial(coAndMSE.co, coAndMSE.mse, audioControl.trialGroup);
					console.log(localStorage)
					document.location.reload();
				});
				audioControl.parentElement.appendChild(submitButton);
			}
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