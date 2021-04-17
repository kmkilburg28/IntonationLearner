class Trial {
	/** @type {number} */
	id;
	/** @type {number} */
	modelTrialId;
	/** @type {string} */
	modelLabel;
	/** @type {number} */
	co;
	/** @type {number} */
	mse;

	/**
	 * @param {number} id 
	 * @param {number} modelTrialId 
	 * @param {string} modelLabel 
	 * @param {number} co 
	 * @param {number} mse 
	 */
	constructor(id, modelTrialId, modelLabel, co, mse) {
		this.id = id;
		this.modelTrialId = modelTrialId;
		this.modelLabel = modelLabel;
		this.co = co;
		this.mse = mse;
	}
}

/**
 * @param {string} trialsGroup
 * @return {Trail[]}
 */
function getTrials(trialsGroup) {
	return getTrailsFromString(localStorage.getItem("trials-" + trialsGroup));
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
 * @param {string} trialsGroup
 */
function attemptCreateTrial(co, mse, trialsGroup) {
	let trials = getTrials(trialsGroup);
	let id = parseInt(localStorage.getItem("lastTrialId"));
	let modelLabel = localStorage.getItem("modelLabel");

	let maxPrevModelId = -1;
	for (let trial of trials) {
		if (trial.id === id) {
			return false;
		}
		if (trial.modelLabel == modelLabel && trial.modelTrialId > maxPrevModelId) {
			maxPrevModelId = trial.modelTrialId;
		}
	}
	let newTrial = new Trial(id, maxPrevModelId+1, modelLabel, co, mse);
	trials.push(newTrial);
	localStorage.setItem("trials-" + trialsGroup, JSON.stringify(trials));

	return newTrial;
}