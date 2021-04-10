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
 * @param {Chart} chart 
 * @param {FrequencyData} frequencyData 
 */
function plotAudioFile(chart, frequencyData) {
	console.log(chart);
	console.log(chart.data);
	console.log(chart.data.datasets);


	chart.data.datasets.forEach((dataset) => {
		// dataset.data.push(frequency);
		// if (dataset.data.length > 200)
		// 	dataset.data.shift();
		if (dataset.label == "Model") {
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