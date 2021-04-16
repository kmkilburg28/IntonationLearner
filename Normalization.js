/**
 * @param {Array} array 
 * @returns {Array}
 */
function NormalizeArray(array) {
	let max = Math.max(...array);
	let min = max;
	for(let i = 0; i < array.length; i++) {
		// Only check for min if array[i] has a value (i.e. > 0)
		if(array[i] > 0 && array[i] < min) {
			min = array[i];
		}
	}
	let range = max - min;
	return array.map(value => value > 0 ? (value - min) / range : -1);
}

function NormalizeTime(array1, array2) {
	let max = Math.max(array1.length, array2.length);
	let min = Math.min(array1.length, array2.length);
	let array = array1.length < array2.length ? array1 : array2;
	let ratio = min / max;
	let ret = new Array();
	let index = 0;
	//let lastReal = array1.length < array2.length ? array1[0] : array2[0];
	for (let i = 0; index < max; i += ratio) {
		let ceil = Math.ceil(i);
		let floor = Math.floor(i);
		let rem = i - floor;
		if (!isReal(array[ceil]) && isReal(array[floor])) {
			ret[index] = array[floor];
		} else if (isReal(array[ceil]) && !isReal(array[floor])) {
			ret[index] = array[ceil];
		} else {
			if (ceil == min) {
				ret[index] = array[floor];
			} else {
				ret[index] = array[floor] * rem + array[ceil] * (1 - rem);
			}
			if(ret[index] == 0){
				ret[index] = -0.1;
			}
		}
		if (ret[index] === undefined || !isReal(ret[index])){
			ret[index] = array[floor];
		}
		index++;
	}
	return ret;
}
