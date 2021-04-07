const modelAudioFiles = [
	"Model Speaker Files/Are you sure.wav",
	"Model Speaker Files/at home.wav",
	"Model Speaker Files/Big Favor.wav",
	"Model Speaker Files/how dare.wav",
	"Model Speaker Files/I cant help.wav",
	"Model Speaker Files/Its too bad.wav",
	"Model Speaker Files/NYC.wav",
	"Model Speaker Files/risk.wav",
	"Model Speaker Files/somewhere.wav",
	"Model Speaker Files/thank you.wav",
];
function initializeSelectAudio(selectId) {
	const selectDOM = document.getElementById(selectId);
	for (let modelAudioFile of modelAudioFiles) {
		const audioOption = document.createElement('option');
		let audioName = modelAudioFile.split('/');
		audioName = audioName[audioName.length-1].split('.')[0];
		audioOption.value = modelAudioFile;
		audioOption.id = audioName;
		audioOption.textContent = audioName;
		selectDOM.appendChild(audioOption);
	}
}