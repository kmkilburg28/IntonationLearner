function getA(){
	let a = new Array;
	for(var i = 0; i < 3; i ++){
		a[i] = i + 65;
	}
	return a;
}
function DTW(modelPitchArr, userPitchArr){
    modelPitchArr = trim(modelPitchArr);
    userPitchArr = trim(userPitchArr);
	userPitchArr = modify(userPitchArr);
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
			d[i][j] = Math.abs(userPitchArr[i] - modelPitchArr[j]);
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
			if(i == 3 && j == 1){
				console.log(M[i - 1][j - 1] + " " +  M[i][j - 1] + " " + M[i - 1][j])
			}
			if(M[i - 1][j - 1] <= M[i][j - 1] && M[i - 1][j - 1] <= M[i - 1][j]){
				min = M[i - 1][j - 1];
				parent[i][j] = {x:i-1,y:j-1};
				
			}else if (M[i][j - 1] <= M[i - 1][j - 1] && M[i][j - 1] <= M[i - 1][j]){
				min = M[i][j - 1];
				parent[i][j] = {x:i,y:j-1};
			}else{
				min = M[i - 1][j];
				parent[i][j] = {x:i-1,y:j};
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


function warp(modelPitchArr, userPitchArr, flag){
	modelPitchArr = trim(modelPitchArr);
    userPitchArr = trim(userPitchArr);
	var dtwMap = DTW(userPitchArr, modelPitchArr);
	userPitchArr = modify(userPitchArr);
	warpedModel = new Array();
	warpedUser = new Array();
	var segment = ModelSegment(modelPitchArr);
	//console.log(segment);
	var warpedSeg = new Array();
	var n = dtwMap.length - 1;
	var i = 0;
	var j = 0;
	var k = 0;
	var segmentIndex = 0;
	while(i <= n && j <= n){
		var mAvg = modelPitchArr[i];
		var uAvg = userPitchArr[j];
		var uCount = 1;
		var mCount = 1;
		while((i < n && dtwMap[i].x == dtwMap[i + 1].x) || (j < n && dtwMap[j].y == dtwMap[j + 1].y)){
			//console.log(i + " " + j);
			if(dtwMap[j].y == dtwMap[j + 1].y){
				j++;
				uAvg += userPitchArr[j];
				uCount++;
				if(j == n){
					break;
				}
			}
			if(dtwMap[i].x == dtwMap[i + 1].x){
				i++;
				mAvg += modelPitchArr[i];
				mCount++;
				if(i == n){
					break;
				}
			}
		}
		if(i >= segment[segmentIndex]){
			warpedSeg[segmentIndex] = k;
			segmentIndex++;
		}
		j++;
		i++;
		warpedModel[k] = mAvg/mCount;
		warpedUser[k] = uAvg/uCount;
		k++;
	}
	if(flag > 0){
		return warpedModel;
	}
	if(flag < 0){
		return warpedSeg;
	}
	return warpedUser;
}

