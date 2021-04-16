function removeNonReal(a){
	a.map(value => isReal(value) ? 0: value);
	return a;
}

function correlationCoe(pitchArr, userPitchArr) {
	pitchArr = removeNonReal(pitchArr);
	userPitchArr = removeNonReal(userPitchArr);
	console.log(pitchArr, userPitchArr);
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

function MSE(array1, array2) {

	let ret = 0;
	for (let i = 0; i < array1.length; i++) {
		let value1 = array1[i];
		if (!isReal(value1)) {
			value1 = 0;
		}
		let value2 = array2[i];
		if (!isReal(value2)) {
			value2 = 0;
		}
		ret += Math.pow(value1[i] - value2[i], 2);
	}
	return ret / array1.length;
}