class RawData {

	/**
	 * @param {Float32Array} buffer 
	 * @param {number} sampleRate 
	 * @param {number} duration 
	 */
	constructor(buffer, sampleRate, duration) {
		this.buffer = buffer;
		this.sampleRate = sampleRate;
		this.duration = duration;
	}
}