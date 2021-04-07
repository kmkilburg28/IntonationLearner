
let normalizedArray = [];

function NormalizePitch(pitchArray) {
	maxPitch = Math.max(...pitchArray);
	minPitch = Math.min(...pitchArray);

	for (i=0; i<pitchArray.length; i++) {
		normalizedPitch = (pitchArray[i]-minPitch)/(maxPitch-minPitch);
        normalizedArray.push(normalizedPitch);
	}
	return normalizedArray;
}
