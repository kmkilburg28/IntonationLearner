const THRESHOLD = 100
//Our segmented array will look like this: [startTimeOfsegment0, endTimeOfsegment0, ... , startTimeOfsegmentn, endTimeOfsegmentn]
function ModelSegment(pitchArr){
	var consec = 0;
	var i = 0;
	var segments = new Array();
	var segmentIndex = 1;
	//The first time we detect a pitch is where we start our first segment
	while(pitchArr[i] <47){
		i++;
	}
	segments[0] = i;
	//This flag indicates whether we have opened a segment without closing it
	var open = true;
	for (; i < pitchArr.length; i++) {
		//if we detect pitch when the segment is closed or if we don't detect pitch when the segment is open
		if ((pitchArr[i] < 47) == open){
			//we start to count for how long we do(not) detect pitch
			consec++;
			//if we detect a sufficient amount of consecutive pitches(non-pitches)
			//we record where it started
			if(consec >= THRESHOLD){
				open = !open;
				segments[segmentIndex] = i - THRESHOLD;
				segmentIndex++;
				consec = 0;
			}
		}else{
			consec = 0;
		}
	}
	//If we haven't closed the last segment we do so
	if(open){
		segments[segmentIndex] = pitchArr.length - 1 - consec;
		open = !open;
	}
	return segments;
}