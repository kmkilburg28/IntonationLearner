/**
 * @param {Float32Array} buffer 
 * @param {number} sampleRate 
 * @param {number} yin_threshold 
 * @returns {number}
 */
function getFrequency(buffer, sampleRate, yin_threshold=0.15) {
	return window.yin(buffer, sampleRate, yin_threshold);
}

/**
 * @param {RawData} rawData
 * @param {number} WINDOW_SIZE default = 2048
 * @param {number} OVERLAP default = 1024
 * @returns {FrequencyData}
 */
function getFrequencies(rawData, WINDOW_SIZE=2048, OVERLAP=2048-256, YIN_THRESHOLD=0.15) {
	const buffer = rawData.buffer;
	const INCREMENT = WINDOW_SIZE - OVERLAP;
	const LENGTH = Math.ceil((buffer.length - WINDOW_SIZE) / INCREMENT);
	const frequencies = new Float32Array(LENGTH);
	for (let i = 0; i < LENGTH; ++i) {
		const startInd = i*INCREMENT;
		const windowed = buffer.subarray(startInd, startInd + WINDOW_SIZE);
		frequencies[i] = getFrequency(windowed, rawData.sampleRate, YIN_THRESHOLD);
		if(isNaN(frequencies[i])){
			frequencies[i] = 0;
		}
	}
	return new FrequencyData(
		cleanFrequencies(frequencies),
		rawData.duration
	);
}

/**
 * @param {Float32Array} frequencies 
 * @returns {Float32Array}
 */
function cleanFrequencies(frequencies) {
	// return frequencies;
	// Remove extremes
	const JUMP_THRESHOLD = 100;
	const JUMP_TIME_LIMIT = 10;
	const LOW_FREQUENCY_THRESHOLD = 50;
	const HIGH_FREQUENCY_THRESHOLD = 500;
	let lastValueTime = 0;
	let lastValue = frequencies[lastValueTime];
	while ((lastValue < LOW_FREQUENCY_THRESHOLD || HIGH_FREQUENCY_THRESHOLD < lastValue) && lastValueTime < frequencies.length) {
		frequencies[lastValueTime] = 0;
		lastValue = frequencies[++lastValueTime];
	}
	for (let i = lastValueTime+1; i < frequencies.length; ++i) {
		if (frequencies[i] < LOW_FREQUENCY_THRESHOLD || HIGH_FREQUENCY_THRESHOLD < frequencies[i] ||
			(Math.abs(frequencies[i] - lastValue) > JUMP_THRESHOLD && i - lastValueTime < JUMP_TIME_LIMIT)) {
			frequencies[i] = 0;
		}
		// else if(Math.abs(frequencies[i] - frequencies[i-1]) > JUMP_THRESHOLD && Math.abs(frequencies[i+1] - frequencies[i]) > JUMP_THRESHOLD) {
		// 	frequencies[i] = 0;
		// }
		else {
			lastValueTime = i;
			lastValue = frequencies[i];
		}
	}
	return frequencies;
}