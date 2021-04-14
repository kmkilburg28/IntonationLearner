function DTW(modelPitchArr, userPitchArr){
    modelPitchArr = trim(modelPitchArr);
    userPitchArr = trim(userPitchArr);
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
			if(M[i - 1][j - 1] <= M[i][j - 1] && M[i - 1][j - 1] <= M[i][j - 1]){
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
	var k = 0;
	var p = parent[userPitchArr.length - 1][modelPitchArr.length - 1];
	while(p.x != 0 || p.y != 0){
		path[k] = p;
		p = parent[p.x][p.y];
		k++;
	}
	path[k] = p;

	return path;
}

function trim(p1){
    p1Segment = ModelSegment(p1);
    p1 = p1.slice(p1Segment[0], p1Segment[p1Segment.length]);
	return p1;
}

function warp(modelPitchArr, userPitchArr, flag){
	modelPitchArr = trim(modelPitchArr);
    userPitchArr = trim(userPitchArr);
	var len = 10;
	var newPitchArr = new Float32Array(userPitchArr.length + len)
	newPitchArr.set(userPitchArr, len);
	//console.log(newPitchArr);
	userPitchArr = newPitchArr;
	var dtwMap = DTW(modelPitchArr, userPitchArr);
	warpedModel = new Array();
	warpedUser = new Array();
	var i = dtwMap.length - 1;
	var j = dtwMap.length - 1;
	var k = 0;
	while(i > 0 && j > 0){
		var mAvg = dtwMap[i].x;
		var uAvg = dtwMap[j].y;
		var uCount = 1;
		var mCount = 1;
		while((i > 0 && dtwMap[i].x == dtwMap[i - 1].x) || (j > 0 && dtwMap[j].y == dtwMap[j - 1].y)){
			
			if(dtwMap[j].y == dtwMap[j - 1].y){
				j--;
				uAvg += dtwMap[j].y;
				uCount++;
				if(j == 0){
					break;
				}
			}
			if(dtwMap[i].x == dtwMap[i - 1].x){
				i--;
				mAvg += dtwMap[i].x;
				mCount++;
				if(i == 0){
					break;
				}
			}
		}
		warpedModel[k] = mAvg/mCount;
		warpedUser[k] = uAvg/uCount;
		k++;
	}
	if(flag > 0){
		return warpedModel;
	}
	return warpedUser;
}

