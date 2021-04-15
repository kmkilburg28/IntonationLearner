/**
 * @param {Array} array 
 * @returns {Array}
 */
function NormalizeArray(array) {
	let max = Math.max(...array);
	let min = max;
	for(let i = 0; i < array.length; i++){
		if(array[i] > 0 && array[i] < min){
			min = array[i];
		}
	}
	
	let range = max - min;
	return array.map(value => value > 0 ? (value - min) / range : 0);
}
