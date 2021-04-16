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

function MSE(pitchArr, userPitchArr){
	var ret = 0;
	for (var i = 0; i < userPitchArr.length; i++) {
		if(!isReal(pitchArr[i])){
			pitchArr[i] = 0;
		}
		if(!isReal(userPitchArr[i])){
			userPitchArr[i] = 0;
		}
		ret += (pitchArr[i] - userPitchArr[i]) * (pitchArr[i] - userPitchArr[i]);
	}
	return ret / userPitchArr.length;
}