const modelLabels = [
	"G",
	"A",
	"B",
	"C",
	"F"
];
const MAX_ATTEMPTS_PER_MODEL = 3;


function fillTrainingList() {
	const modelAudioDatasGroup = modelAudioDatas.filter(modelAudioData => modelLabels.includes(modelAudioData.label));

	const trials = getTrials("training");
	const listDom = document.getElementById("modelAudioList-training");
	listDom.parentNode.style.display = "";
	let allTrialsCompleted = true;
	for (let i = 0; i < modelAudioDatasGroup.length; ++i) {
		const modelAudioData = modelAudioDatasGroup[i];
		const listItemDOM = document.createElement('li');

		const modelAudioTrials = trials.filter(trial => trial.modelLabel === modelAudioData.label);
		const progressMeter = "(" + modelAudioTrials.length + "/" + MAX_ATTEMPTS_PER_MODEL + "): ";

		if (modelAudioTrials.length < MAX_ATTEMPTS_PER_MODEL) {
			const anchorDOM = document.createElement('a');
			anchorDOM.textContent = progressMeter + modelAudioData.text;
			anchorDOM.href = "training.html";
			anchorDOM.addEventListener('click', () => localStorage.setItem('modelLabel', modelAudioData.label));
			listItemDOM.appendChild(anchorDOM);
			allTrialsCompleted = false;
		}
		else {
			listItemDOM.textContent = progressMeter + modelAudioData.text;
		}

		listItemDOM.setAttribute('id', 'listItem-' + modelAudioData.label);
		listDom.appendChild(listItemDOM);
	}

	testAndHideIfComplete(allTrialsCompleted, listDom);
	return allTrialsCompleted;
}

function fillTestBox(testType) {
	const modelAudioDatasGroup = modelAudioDatas.filter(modelAudioData => modelLabels.includes(modelAudioData.label));

	const trials = getTrials("trials-" + testType);
	const listDom = document.getElementById("modelAudioList-" + testType);
	listDom.parentNode.style.display = "";
	let allTrialsCompleted = true;
	for (let i = 0; i < modelAudioDatasGroup.length; ++i) {
		const modelAudioData = modelAudioDatasGroup[i];
		const container = document.createElement('div');

		const modelAudioTrials = trials.filter(trial => trial.modelLabel === modelAudioData.label);

		// const audioBuffer = await loadAudioFile(modelAudioData.location);
		// listenButton.addEventListener('click', () => playAudioBuffer(audioBuffer));

		container.textContent = "File " + (i+1) + ": " + modelAudioData.text;
		if (modelAudioTrials.length < MAX_ATTEMPTS_PER_MODEL) {
			allTrialsCompleted = false;
		}


		const audioDOM = document.createElement("audio");
		audioDOM.src = modelAudioData.location;
		audioDOM.type = "audio/wav";
		audioDOM.controls = true;

		container.appendChild(document.createElement('br'));
		container.appendChild(audioDOM);
		container.appendChild(document.createElement('br'));

		const controlsDiv = document.createElement('div');

		const recordButton = document.createElement('button');
		const progressMeter = "(" + modelAudioTrials.length + "/" + MAX_ATTEMPTS_PER_MODEL + "): ";
		recordButton.textContent = progressMeter + "Record";
		if (modelAudioTrials.length >= MAX_ATTEMPTS_PER_MODEL) {
			recordButton.disabled = true;
		}
		else {
			allTrialsCompleted = false;
		}
		recordButton.trialGroup = "trials-" + testType;
		recordButton.modelAudioData = modelAudioData;
		recordButton.addEventListener('click', recordAudioTest);
		controlsDiv.appendChild(recordButton);

		container.appendChild(controlsDiv);
		container.appendChild(document.createElement('br'));

		container.setAttribute('id', 'listItem-' + modelAudioData.label);
		listDom.appendChild(container);
	}

	testAndHideIfComplete(allTrialsCompleted, listDom);
	return allTrialsCompleted;
}

function testAndHideIfComplete(allTrialsCompleted, listDom) {
	if (allTrialsCompleted) {
		const parent = listDom.parentElement;
		parent.removeChild(listDom);
		parent.innerHTML += "Complete.";
	}
}