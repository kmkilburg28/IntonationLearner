const modelAudioFiles = [
	"Model Speaker Files/A.wav",
	"Model Speaker Files/B.wav",
	"Model Speaker Files/C.wav",
	"Model Speaker Files/D.wav",
	"Model Speaker Files/E.wav",
	"Model Speaker Files/F.wav",
	"Model Speaker Files/G.wav",
	"Model Speaker Files/H.wav",
	"Model Speaker Files/I.wav",
	"Model Speaker Files/J.wav",
	"Model Speaker Files/K.wav",
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