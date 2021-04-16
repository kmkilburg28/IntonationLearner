class Trial {
	/** @type {number} */
	id;
	/** @type {number} */
	modelTrialId;
	/** @type {string} */
	modelfile;
	/** @type {number} */
	co;
	/** @type {number} */
	mse;

	/**
	 * @param {number} id 
	 * @param {number} modelTrialId 
	 * @param {string} modelfile 
	 * @param {number} co 
	 * @param {number} mse 
	 */
	constructor(id, modelTrialId, modelfile, co, mse) {
		this.id = id;
		this.modelTrialId = modelTrialId;
		this.modelfile = modelfile;
		this.co = co;
		this.mse = mse;
	}
}

/**
 * @param {string} trialsString
 * @return {Trial[]}
 */
function getTrailsFromString(trialsString) {
	if (trialsString == null || trialsString.length == 0)
		return [];

	/** @type {Trail[]} */
	let trialsJSON = JSON.parse(trialsString);
	return trialsJSON;
}

/**
 * @param {number} co 
 * @param {number} mse 
 */
function attemptCreateTrial(co, mse) {
	let trials = getTrailsFromString(localStorage.getItem("trials"));
	let id = parseInt(localStorage.getItem("lastTrialId"));
	let modelfile = localStorage.getItem("modelfile");

	let maxPrevModelId = -1;
	for (let trial of trials) {
		if (trial.id === id) {
			return false;
		}
		if (trial.modelfile == modelfile && trial.modelTrialId > maxPrevModelId) {
			maxPrevModelId = trial.modelTrialId;
		}
	}
	let newTrial = new Trial(id, maxPrevModelId+1, modelfile, co, mse);
	trials.push(newTrial);
	localStorage.setItem("trials", JSON.stringify(trials));

	return true;
}