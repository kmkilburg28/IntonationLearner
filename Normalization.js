
let normalizedPArray = [];

function NormalizePitch(pitchArray) {
	maxPitch = Math.max(...pitchArray);
	minPitch = Math.min(...pitchArray);

	for (i=0; i<pitchArray.length; i++) {
		normalizedPitch = (pitchArray[i]-minPitch)/(maxPitch-minPitch);
        normalizedPArray.push(normalizedPitch);
	}
	return normalizedPArray;
}


let normalizedTArray = [];

function NormalizeTime(timeArray) {
	maxTime = Math.max(...timeArray);
	minTime = Math.min(...timeArray);

	for (i=0; i<timeArray.length; i++) {
		normalizedTime = (timeArray[i]-minTime)/(maxTime-minTime);
        normalizedTArray.push(normalizedTime);
	}
	return normalizedTArray;
}



