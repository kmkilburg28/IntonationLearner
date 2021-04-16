function downloadData() {
	let trialsString = localStorage.getItem("trials");
	if (trialsString == null) {
		trialsString = "[]";
	}
	alert('Thank you for demoing Tone Nation.');
	download("ToneNation_UserData.txt", trialsString);
}

/**
 * @param {string} filename 
 * @param {string} text 
 */
function download(filename, text) {
	let anchor = document.createElement('a');
	anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	anchor.setAttribute('download', filename);

	anchor.style.display = 'none';
	document.body.appendChild(anchor);

	anchor.click();

	document.body.removeChild(anchor);
}