function DTW(modelPitchArr, userPitchArr){
    modelPitchArr = trim(modelPitchArr);
    userPitchArr = trim(userPitchArr);
	var M = new Array();
	var d = new Array();
	var parent = new Array();
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
	}
	for(var i = 1; i < userPitchArr.length; i++){
		//console.log(i);
		M[i][0] = M[i - 1][0] + d[i][0]; 
	}

	for(var i = 1; i < userPitchArr.length; i++){
		for(var j = 1; j < modelPitchArr.length; j++){
			var min;
			if(M[i - 1][j - 1] <= M[i][j - 1] && M[i - 1][j - 1] <= M[i][j - 1]){
				min = M[i - 1][j - 1];
			}else if (M[i][j - 1] <= M[i - 1][j - 1] && M[i][j - 1] <= M[i - 1][j]){
				min = M[i][j - 1];
			}else{
				min = M[i - 1][j];
			}
			M[i][j] = d[i][j] + min;
		}
	}
	for(var i = 1; i < userPitchArr.length; i++){
		console.log(M[i]);
	}
	
	return M;
}

function trim(p1){
    p1Segment = ModelSegment(p1);
    p1 = p1.slice(p1Segment[0], p1Segment[p1Segment.length]);
	return p1;
}

