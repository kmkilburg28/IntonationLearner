/**
 * @param {string} ulId 
 * @param {AudioFileData[]} modelAudioDatas
 */
function initializeULAudio(ulId, modelAudioDatas) {
	const listDom = document.getElementById(ulId);
	for (let modelAudioData of modelAudioDatas) {
		const listItemDOM = document.createElement('li');
		const anchorDOM = document.createElement('a');
		anchorDOM.textContent = modelAudioData.text;
		let label = modelAudioData.label;
		anchorDOM.href = "training.html";
		anchorDOM.addEventListener('click', () => localStorage.setItem('modelLabel', label));
		listItemDOM.appendChild(anchorDOM);
		listItemDOM.setAttribute('id', 'listItem-' + modelAudioData.label);
		listDom.appendChild(listItemDOM);
	}
}
/**
 * @param {Trail[]} trials 
 */
function plotProgress(trials) {
	let modelLabels = new Set(trials.map(trial => trial.modelLabel));
	for (let modelLabel of modelLabels) {
		const listItem = document.getElementById('listItem-' + modelLabel);
		if (listItem == undefined) {
			continue;
		}
		const modelLabelTrials = trials.filter(trial => trial.modelLabel === modelLabel);

		const container = document.createElement('div');
		container.setAttribute('style', 'width:15%');

		const div = document.createElement('div');
		div.classList.add('chart-container');

		const canvas = document.createElement('canvas');
		div.appendChild(canvas);
		container.appendChild(div);
		listItem.appendChild(container);

		const ctx = canvas.getContext('2d');
		const config = createChartConfig(["Percentage"]);
		config.options.title.display = false;
		const chart = new Chart(ctx, config);

		for (let i = 0; i < modelLabelTrials.length; ++i) { chart.data.labels[i] = i+1; }
		for (let modelLabelTrial of modelLabelTrials) {
			// Co is on scale of -1 to 1; interpolate to a 0 to 1 scale
			chart.data.datasets[0].data.push((modelLabelTrial.co + 1) / 2);
			// chart.data.datasets[0].data.push(1 - modelLabelTrial.mse);
		}
		chart.update();
	}
}

function createChartConfig(datasetLabels) {
	let chartColors = Object.values(window.chartColors);
	let chartColorInd = 0;
	return {
		type: 'line',
		data: {
			labels: [],
			datasets: datasetLabels.map(label => {
				let dataset = {
					label: label,
					backgroundColor: chartColors[chartColorInd],
					borderColor: chartColors[chartColorInd],
					data: [],
					fill: false,
					pointRadius: 2,
					pointHoverRadius: 15,
					// showLine: false // no line shown
				};
				chartColorInd = (chartColorInd + 1) % chartColors.length;
				return dataset;
			})
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: 'Performance History'
			},
			legend: {
				display: false
			},
			elements: {
				point: {
					pointStyle: 'circle'
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						min: 0.0,
						max: 1.0
					}
				}]
			},
			animation: {
				duration: 10,
				easing: 'linear'
			}
		}
	};
}