/**
 * @param {Array} array 
 * @returns {Array}
 */
function NormalizeArray(array) {
	let max = Math.max(...array);
	let min = Math.min(...array);
	
	let range = max - min;
	return array.map(value => (value - min) / range);
}
