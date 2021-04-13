/**
 * @param {Float32Array} buffer 
 * @param {number} sampleRate 
 * @returns {number}
 */
function getFrequency(buffer, sampleRate) {
	return window.yin(buffer, sampleRate, 0.15);
}

/**
 * @param {RawData} rawData
 * @param {number} WINDOW_SIZE default = 2048
 * @param {number} OVERLAP default = 1024
 * @returns {FrequencyData}
 */
function getFrequencies(rawData, WINDOW_SIZE=2048, OVERLAP=2048-256) {
	const buffer = rawData.buffer;
	const INCREMENT = WINDOW_SIZE - OVERLAP;
	const LENGTH = Math.ceil((buffer.length - WINDOW_SIZE) / INCREMENT);
	const frequencies = new Float32Array(LENGTH);
	for (let i = 0; i < LENGTH; ++i) {
		const startInd = i*INCREMENT;
		const windowed = buffer.subarray(startInd, startInd + WINDOW_SIZE);
		frequencies[i] = getFrequency(windowed, rawData.sampleRate);
	}
	return new FrequencyData(
		frequencies,
		rawData.duration
	);
}