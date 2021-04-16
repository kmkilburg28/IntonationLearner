/**
 * @param {number} value 
 * @returns {number}
 */
function forceToReal(value) {
	return value < 0 ? 0 : (value > 1 ? 1 : value);
}
/**
 * @param {Array} a 
 * @returns {Array}
 */
function removeNonReal(a){
	return a.map(forceToReal);
}

/**
 * @param {Array} pitchArr 
 * @param {Array} userPitchArr 
 * @returns {number}
 */
function correlationCoe(pitchArr, userPitchArr) {
	pitchArr = removeNonReal(pitchArr);
	userPitchArr = removeNonReal(userPitchArr);

	var modelAvg = 0;

	for (var i = 0; i < pitchArr.length; i++) {
		modelAvg += pitchArr[i];
	}
	modelAvg /= pitchArr.length;
	var userAvg = 0;
	for (var i = 0; i < userPitchArr.length; i++) {
		userAvg += userPitchArr[i];
	}
	userAvg /= userPitchArr.length;

	var nume = 0;
	var denomUser = 0;
	var denomModel = 0;
	for (var i = 0; i < userPitchArr.length; i++){
		nume += (userPitchArr[i] - userAvg) * (pitchArr[i] - modelAvg);
		denomUser += (userPitchArr[i] - userAvg) * (userPitchArr[i] - userAvg);
		denomModel += (pitchArr[i] - modelAvg) * (pitchArr[i] - modelAvg);
	}
	var denom = denomUser * denomModel;
	denom = Math.sqrt(denom);
	return nume / denom;
}

/**
 * @param {Array} array1
 * @param {Array} array2
 * @returns {number}
 */
function MSE(array1, array2) {
	let ret = 0;
	for (let i = 0; i < array1.length; ++i) {
		let value1 = forceToReal(array1[i]);
		let value2 = forceToReal(array2[i]);
		ret += Math.pow(value1 - value2, 2);
	}
	return ret / array1.length;
}