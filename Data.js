function downloadData() {
	console.log(localStorage);
	let storageAsText = JSON.stringify(localStorage);
	alert('This is a demo\n' + storageAsText)
}