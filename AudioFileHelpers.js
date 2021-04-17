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
				alert("Error loading file! Refreshing to try again.");
				document.location.reload();
				reject(reject.response);
			}
		};
		request.onerror = () => {
			console.error(request.response);
				alert("Please check your internet connection.\nError loading file from \n" + src + "\nRefreshing to try again.");
				document.location.reload();
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

/**
 * @param {Float32Array} frequencies1 
 * @param {Float32Array} frequencies2 
 * @returns {{normalized1: Float32Array, normalized2: Float32Array}}
 */
function normalizeFrequencyArray(frequencies1, frequencies2) {
	let n1 = trim(NormalizeArray(frequencies1));
	let n2 = trim(NormalizeArray(frequencies2));

	n2 = n2.length < n1.length ? NormalizeTime(n2, n1) : n2;
	n1 = n2.length < n1.length ? n1 : NormalizeTime(n2, n1);
	return {
		normalized1: n1,
		normalized2: n2
	}
}

/**
 * @param {Float32Array} frequencies1 
 * @param {Float32Array} frequencies2 
 * @return {{co: {number}, mse:{number}}}
 */
function getCoAndMSE(frequencies1, frequencies2) {
	const SplineArray1 = getSplineFromArray(frequencies1, 0.01);
	const smoothed1 = evaluateSplineArray(SplineArray1, 0, frequencies1.length);

	const SplineArray2 = getSplineFromArray(frequencies2, 0.01);
	const smoothed2 = evaluateSplineArray(SplineArray2, 0, frequencies2.length);

	return {
		co: correlationCoe(smoothed2, smoothed1),
		mse: MSE(smoothed1, smoothed2)
	};
}