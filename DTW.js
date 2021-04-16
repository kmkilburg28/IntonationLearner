function isReal(num){
	return 0 <= num && num <= 1;
}


function DTW(modelPitchArr, userPitchArr){
	var M = new Array();
	var d = new Array();
	var parent = new Array();
	var path = new Array();
	for(var i = 0; i < userPitchArr.length; i++){
		M[i] = new Array();
		d[i] = new Array();
		parent[i] = new Array();
	}
	for(var i = 0; i < userPitchArr.length; i++){
		for(var j = 0; j < modelPitchArr.length; j++){
			d[i][j] = Math.abs(userPitchArr[i] - modelPitchArr[j]) + .005 * Math.abs(i - j);
		}
	}
	M[0][0] = d[0][0];
	for(var j = 1; j < modelPitchArr.length; j++){
		M[0][j] = M[0][j - 1] + d[0][j];
		parent[0][j] = {x:0,y:j-1};
	}
	for(var i = 1; i < userPitchArr.length; i++){
		M[i][0] = M[i - 1][0] + d[i][0];
		parent[i][0] = {x:i-1,y:0};
	}

	for(var i = 1; i < userPitchArr.length; i++){
		for(var j = 1; j < modelPitchArr.length; j++){
			var min;
			if(M[i - 1][j - 1] <= M[i][j - 1] && M[i - 1][j - 1] <= M[i - 1][j]){
				min = M[i - 1][j - 1];
				parent[i][j] = {x:i-1,y:j-1};
				
			}else if (M[i][j - 1] <= M[i - 1][j - 1] && M[i][j - 1] <= M[i - 1][j]){
				min = M[i][j - 1];
				parent[i][j] = {x:i,y:j-1};
			}else if (M[i - 1][j] <= M[i - 1][j - 1] && M[i - 1][j] <= M[i][j - 1]){
				min = M[i - 1][j];
				parent[i][j] = {x:i-1,y:j};
			}else{
				console.log("FAILED");
			}
			M[i][j] = d[i][j] + min;
		}
	}
	var k = 1;
	path[0] = {x:userPitchArr.length - 1,y:modelPitchArr.length - 1};
	var p = parent[userPitchArr.length - 1][modelPitchArr.length - 1];
	while(p.x != 0 || p.y != 0){
		path[k] = p;
		p = parent[p.x][p.y];
		k++;
	}
	path[k] = p;
	path = flip(path);
	return path;
}

function modify(p1){
	var len = p1.length;
	var newPitchArr = new Array(p1.length + len);
	for(var i = 0; i < len; i++){
		newPitchArr[2*i] = p1[i];
		newPitchArr[2*i + 1] = p1[i];
		
	}
	return trim(newPitchArr);
}

function flip(a){
	var n = a.length;
	for(var i = 0; i < n/2; i++){
		var temp = a[i];
		a[i] = a[n - i - 1];
		a[n - i - 1] = temp;
	}
	return a;
}

function trim(p1){
    p1Segment = ModelSegment(p1);
    p1 = p1.slice(p1Segment[0], p1Segment[p1Segment.length - 1] + 1);
	return p1;
}


function warp(modelPitchArr, userPitchArr){
	console.log(modelPitchArr, userPitchArr);
	modelPitchArr = trim(modelPitchArr);
    userPitchArr = trim(userPitchArr);
	var dtwMap = DTW(modelPitchArr, userPitchArr);
	//console.log(dtwMap);
	warpedModel = new Array();
	warpedUser = new Array();
	var segment = ModelSegment(modelPitchArr);
	var userSegment = new Array();
	console.log(segment);
	var warpedSeg = new Array();
	var n = dtwMap.length - 1;

	var i = 0;
	var j = 0;
	var k = 0;
	var segmentIndex = 0;
	var lastMFinite = modelPitchArr[dtwMap[j].x];
	var lastUFinite = userPitchArr[dtwMap[i].y];
	
	while(i <= n && j <= n){
		if(isReal(userPitchArr[dtwMap[i].y])){
			lastUFinite = userPitchArr[dtwMap[i].y];
		}
		if(isReal(modelPitchArr[dtwMap[j].x])){
			lastMFinite = modelPitchArr[dtwMap[j].x];
		}
		var mAvg =  modelPitchArr[dtwMap[j].x];
		var uAvg = userPitchArr[dtwMap[i].y];
		var uCount = 1;
		var mCount = 1;
		while((i < n && dtwMap[i].x == dtwMap[i + 1].x) || (j < n && dtwMap[j].y == dtwMap[j + 1].y)){
			//console.log(i + " " + j);
			if(dtwMap[j].y == dtwMap[j + 1].y){
				j++;
				if(isReal(modelPitchArr[dtwMap[j].x])){
					mAvg += modelPitchArr[dtwMap[j].x];
					mCount++;
					lastMFinite = modelPitchArr[dtwMap[j].x];
				}
				if(j == n){
					break;
				}
			}
			if(dtwMap[i].x == dtwMap[i + 1].x){
				i++;
				if(isReal(userPitchArr[dtwMap[i].y])){
					uAvg += userPitchArr[dtwMap[i].y];
					uCount++;
					lastUFinite = userPitchArr[dtwMap[i].y];
				}
				if(i == n){
					break;
				}
			}
		}

		if(dtwMap[j].y >= segment[segmentIndex]){
			userSegment[segmentIndex] = dtwMap[i].x; 
			warpedSeg[segmentIndex] = k;
			segmentIndex++;
		}
		
		warpedModel[k] = mAvg/mCount;
		warpedUser[k] = uAvg/uCount;
		console.log(i,j,k, warpedUser[k], warpedModel[k], warpedSeg[segmentIndex - 1]);
		i++;
		j++;
		k++;
		
	}
	if(warpedSeg.length % 2 == 1){
		warpedSeg[segmentIndex] = k;
	}
	i = 0;
	segmentIndex = 0;

	var testArr = new Array();
	while(segmentIndex < warpedSeg.length){
		while(i < n && dtwMap[i].x < warpedSeg[segmentIndex]){
			i++;
		}
		if(warpedSeg.length %2 == 1){
			while(i < n && dtwMap[i].x < warpedSeg[segmentIndex] + 1){
				i++;
			}
		}
		testArr[segmentIndex] = dtwMap[i].y;
		segmentIndex++;
	}
	
	console.log(userPitchArr);
	console.log(modelPitchArr);
	console.log(dtwMap);
	console.log(warpedModel, warpedSeg, warpedUser);
	
	return {model:SegmentFormat(warpedModel,warpedSeg), user:SegmentFormat(warpedUser,warpedSeg), userSeg:userSegment, modelSeg:segment};
}

