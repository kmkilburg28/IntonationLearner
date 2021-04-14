class FrequencyData {
	/** @type {Float32Array} */ buffer;
	/** @type {number} */ duration;
	/**
	 * @param {Float32Array} buffer 
	 * @param {number} duration 
	 */
	constructor(buffer, duration) {
		this.buffer = buffer;
		this.duration = duration;
	}
}