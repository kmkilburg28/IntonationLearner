class AudioFileData {
	/**
	 * @param {string} text 
	 * @param {string} label 
	 * @param {string} location 
	 */
	constructor(text, label, location) {
		this.text = text;
		this.label = label;
		this.location = location;
	}
}

const modelAudioDatas = [
	new AudioFileData("Are you sure about that?",                "A", "Model Speaker Files/A.wav"),
	new AudioFileData("Make yourself at home.",                  "B", "Model Speaker Files/B.wav"),
	new AudioFileData("I have a big favor to ask.",              "C", "Model Speaker Files/C.wav"),
	new AudioFileData("How dare you turn him down!",             "D", "Model Speaker Files/D.wav"),
	new AudioFileData("I can't help but feel sorry for him.",    "E", "Model Speaker Files/E.wav"),
	new AudioFileData("It's too bad that you can't come.",       "F", "Model Speaker Files/F.wav"),
	new AudioFileData("New York City is a tough place to live.", "G", "Model Speaker Files/G.wav"),
	new AudioFileData("We may as well take the risk.",           "H", "Model Speaker Files/H.wav"),

	new AudioFileData("It's got to be here somewhere!",          "J", "Model Speaker Files/J.wav"),
	new AudioFileData("Thank you for your help.",                "K", "Model Speaker Files/K.wav"),
];
const baseURL = "https://kmkilburg28.github.io/IntonationLearner/";
for (let audioFileData of modelAudioDatas) {
	audioFileData.location = baseURL + audioFileData.location; 
}

/**
 * @return {AudioFileData}
 */
function getPageModelAudioData() {
	// const params = new URLSearchParams(window.location.search);
	// if (params.has("uploaded")) {} // TODO

	const modelLabel = localStorage.getItem('modelLabel');
	console.log(modelLabel);
	if (modelLabel == null) {
		console.error("No model label found in local storage.");
		return false;
	}
	return modelAudioDatas.find(modelAudioFile => modelAudioFile.label == modelLabel);
}