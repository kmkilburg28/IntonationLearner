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
 * @param {Array} array 
 * @param {Chart} chart
 * @param {string} datasetLabel
 */
 function plotArray(array, chart, datasetLabel) {
	chart.data.datasets.forEach((dataset) => {
		if (dataset.label == datasetLabel) {
			dataset.data = new array.constructor(array.length);
			for (let i = 0; i < array.length; ++i) {
				dataset.data[i] = array[i];
				if (chart.data.labels.length <= i) {
					chart.data.labels[i] = i;
				}
			}
		}
	});
	chart.update();
}