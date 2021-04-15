function correlationCoe(pitchArr, userPitchArr) {
	var modelAvg = 0;

	for (var i = 0; i < pitchArr.length; i++) {
		if(pitchArr[i] < 0){
			pitchArr[i] = 0;
		}
		modelAvg += pitchArr[i];
	}
	modelAvg /= pitchArr.length;
	var userAvg = 0;
	for (var i = 0; i < userPitchArr.length; i++) {
		if(userPitchArr[i] < 0){
			userPitchArr[i] = 0;
		}
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
		ret += (pitchArr[i] - userPitchArr[i]) * (pitchArr[i] - userPitchArr[i]);
	}
	return ret / userPitchArr.length;
}