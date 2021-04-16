/**
 * @param {Array} array 
 * @returns {Array}
 */
function NormalizeArray(array) {
	let max = Math.max(...array);
	let min = max;
	for(let i = 0; i < array.length; i++) {
		if(array[i] > 0 && array[i] < min) {
			min = array[i];
		}
	}
	let range = max - min;
	return array.map(value => value > 0 ? (value - min) / range : -1);
}

function NormalizeTime(array, array2) {
	let max = Math.max(array.length, array2.length);
	let min = Math.min(array.length, array2.length);
	let flag = array.length < array2.length ? true : false;
	let ratio = min/max;
	let ret = new Array();
	let index = 0;
	//let lastReal = array.length < array2.length ? array[0] : array2[0];
	for(let i = 0; index < max; i += ratio) {
		let ceil = Math.ceil(i);
		let floor = Math.floor(i);
		let rem = i - floor;
		if(flag){
			if(!isReal(array[ceil]) && isReal(array[floor])){
				ret[index] = array[floor];
			}else if(isReal(array[ceil]) && !isReal(array[floor])){
				ret[index] = array[ceil];
			}else{
				if(ceil == min){
					ret[index] = array[floor];
				}else{
					ret[index] = array[floor] * rem + array[ceil] * (1 - rem);
				} 
				if(ret[index] == 0){
					ret[index] = -.1;
				}
			}
			if(ret[index] === undefined|| !isReal(ret[index])){
				ret[index] = array[floor];
			}
		}else{
			if(!isReal(array2[ceil]) && isReal(array2[floor])){
				ret[index] = array2[floor];
			}else if(isReal(array2[ceil]) && !isReal(array2[floor])){
				ret[index] = array2[ceil];
			}else{
				if(ceil == min){
					ret[index] = array2[floor];
				}else{
				ret[index] = array2[floor] * rem + array2[ceil] * (1 - rem);
				}
				if(ret[index] == 0){
					ret[index] = 1.1;
				}
			}
			if(ret[index] === undefined || !isReal(ret[index])){
				ret[index] = array2[floor];
			}
		}
		index++;
	}
	return ret;
}
