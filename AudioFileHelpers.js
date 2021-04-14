/**
 * @param {string} src 
 * @returns {Promise<AudioBuffer|undefined>}
 */
async function loadAudioFile(src) {
	return new Promise(async (resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open("GET", src);
		request.responseType = "arraybuffer";
		request.onload = async () => {
			if (request.status === 200) {
				const undecodedAudio = request.response;
				const audioBuffer = await audioContext.decodeAudioData(undecodedAudio);
				resolve(audioBuffer);
			}
			else {
				console.error(request.response);
				reject(reject.response);
			}
		};
		request.send();
	});
}

/**
 * @param {AudioBuffer} audioBuffer 
 * @param {number} volume 
 */
function playAudioBuffer(audioBuffer, volume=1) {
	const source = audioContext.createBufferSource();
	source.buffer = audioBuffer;
	const gainNode = audioContext.createGain();
	gainNode.gain.value = volume;
	source.connect(gainNode);
	gainNode.connect(audioContext.destination);
	source.start();
}

/**
 * @param {AudioBuffer} audioBuffer 
 * @returns {RawData}
 */
function parseAudioBuffer(audioBuffer) {
	// Grab averaged data
	const averagedChannelData = new Float32Array(audioBuffer.length);
	const numChannels = audioBuffer.numberOfChannels
	for (let channelInd = 0; channelInd < numChannels; ++channelInd) {
		let curChannel = audioBuffer.getChannelData(channelInd);
		for (let i = 0; i < averagedChannelData.length; ++i) {
			averagedChannelData[i] += curChannel[i];
		}
	}
	for (let i = 0; i < averagedChannelData.length; ++i) {
		averagedChannelData[i] /= numChannels;
	}
	return new RawData(
		averagedChannelData,
		audioBuffer.sampleRate,
		audioBuffer.duration,
	);
}
/**
 * @param {string} rawDataString 
 */
function stringToRawData(rawDataString) {
	let rawDataJSON = JSON.parse(rawDataString);
	return new RawData(
		Float32Array.from(Object.values(rawDataJSON.buffer)),
		rawDataJSON.sampleRate,
		rawDataJSON.duration
	);
}

/**
 * @param {FrequencyData} frequencyData 
 * @param {Chart} chart
 * @param {string} datasetLabel
 */
function plotFrequencies(frequencyData, chart, datasetLabel) {
	chart.data.datasets.forEach((dataset) => {
		if (dataset.label == datasetLabel) {
			console.log(frequencyData);
			dataset.data = new Array(frequencyData.buffer.length);
			console.log(dataset.data)
			for (let i = 0; i < frequencyData.buffer.length; ++i) {
				dataset.data[i] = frequencyData.buffer[i];
				if (chart.data.labels.length <= i) {
					chart.data.labels[i] = i;
				}
			}
			console.log(dataset.data)
		}
	});
	chart.update();
}

/**
 * @param {Spline[]} S
 * @param {Chart} chart
 * @param {string} datasetLabel
 */
 function plotSpline(S, chart, datasetLabel) {
	chart.data.datasets.forEach((dataset) => {
		if (dataset.label == datasetLabel) {
			dataset.data = new Array(S.length);
			const STEP_SIZE = 1;
			let i = 0;
			for (let t  = 0; t < S[S.length-1].x; t += STEP_SIZE) {
				if (i < S.length - 1 && S[i+1].x < t)
					i = i + 1;
				if (i > 0) {
					chart.data.labels[t] = t;
					let y = S[i].evaluate(t);
					dataset.data[t] = y;
				}
			}
		}
	});
	chart.update();
}