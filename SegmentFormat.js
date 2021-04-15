function SegmentFormat(pitchArr, segmentArr) {
	var retArr = new Array();
	var index = 0;
	for (var i = 0; i < segmentArr.length; i += 2) {
		retArr[index] = new Array();
		for (var j = 0; j < segmentArr[i + 1] - segmentArr[i]; j++) {
			retArr[index][j] = pitchArr[j + segmentArr[i]];
		}
		index++;
	}
	return retArr;
}