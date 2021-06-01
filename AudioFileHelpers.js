/**
 * @param {string} src 
 * @returns {Promise<AudioBuffer|undefined>}
 */
async function loadAudioFile(src) {
	if (src == "modelUpload") {
		return retrieveRawAudio("modelUpload");
	}
	return new Promise(async (resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open("GET", src);
		request.responseType = "arraybuffer";
		request.onload = async () => {
			if (request.status === 200) {
				const undecodedAudio = request.response;
				const audioBuffer = await audioContext.decodeAudioData(undecodedAudio);
				resolve(audioBuffer);
			}
			else {
				console.error(request.response);
				request.open("GET", src);
				request.send();
				// alert("Error loading file! Refreshing to try again.");
				// document.location.reload();
				// reject(reject.response);
			}
		};
		request.onerror = () => {
				console.error(request.response);
				request.open("GET", src);
				request.send();
				// alert("Please check your internet connection.\nError loading file from \n" + src + "\nRefreshing to try again.");
				// document.location.reload();
		};
		request.send();
	});
}

// /**
//  * @param {string} src
//  * @returns {AudioBuffer}
//  */
// function retrieveRawAudio(src) {
// 	return stringToRawData(LZString.decompress(localStorage.getItem(src)));
// }
/**
 * @param {string} src
 * @returns {AudioBuffer}
 */
function retrieveRawAudio(src) {
	return new Promise(async (resolve, reject) => {

		const objectStoreKey = "CompressedAudioFiles";
		const objectStore = await initializeTransaction(objectStoreKey, "readonly", src);
		if (!objectStore) {
			reject(objectStore);
		}

		const requestRead = objectStore.get(src);

		requestRead.onerror = () => {
			alert("Audio file failed to upload. Please try again with a shorter audio clip.");
			reject(false);
		}
		requestRead.onsuccess = (e) => {
			console.log(e);
			let audioBuffer = stringToRawData(LZString.decompress(e.target.result.data));
			resolve(audioBuffer);
		};
	});
}
/**
 * @param {string} src
 * @param {RawData} rawData
 * @returns {Promise<boolean>}
 */
function storeRawAudio(src, rawData) {
	return new Promise(async (resolve, reject) => {

		const objectStoreKey = "CompressedAudioFiles";
		const objectStore = await initializeTransaction(objectStoreKey, "readwrite", src);
		if (!objectStore) {
			reject(objectStore);
		}

		const entry = {
			"label" : src,
			"data" : LZString.compress(JSON.stringify(rawData))
		};

		const requestWrite = objectStore.put(entry);
		requestWrite.onerror = () => {
			alert("Audio file failed to upload. Please try again with a shorter audio clip.");
			reject(false);
		}
		requestWrite.onsuccess = () => {
			// I'm not sure why this extra check is required, I assume its a timing thing as it is only necessary for a browser's first upload.
			// Otherwise, it says the db entry doesn't exist when 'retrieveRawAudio' is called on a separate page
			retrieveRawAudio(src).then((rawDataCheck) => {
				if (rawDataCheck)
					resolve(true);
				else {
					console.error("Database entry was supposedly successfully, but the entry is not found.")
					reject(false);
				}
			})
		};
	});
}

/**
 * @param {string} objectStoreKey 
 * @param {string} mode 
 * @returns {Promise<IDBObjectStore | false>}
 */
async function initializeTransaction(objectStoreKey, mode, label) {
	return new Promise(async (resolve, reject) => {
		const request = window.indexedDB.open("IntonationLearner");

		request.onerror = (e) => {
			console.error(e.target);
			reject(false);
		};

		request.onupgradeneeded = (e) => {
			const db = e.target.result;
			const objectStore = db.createObjectStore(objectStoreKey, { keyPath: "label" });
			objectStore.oncomplete = () => {
				objectStore.add({'label': label, 'data': undefined});
			};
		};
		request.onsuccess = (e) => {
			const db = e.target.result;
			const transaction = db.transaction([objectStoreKey], mode);
			
			transaction.onerror = () => {
				alert("Transaction error for IndexedDB");
				reject(false);
			};


			resolve(transaction.objectStore(objectStoreKey));
		};
	});

}

/**
 * @param {AudioBuffer | RawData} audioBuffer 
 * @param {number} volume 
 */
function playAudioBuffer(audioBuffer, volume=1) {
	if (audioBuffer instanceof RawData) {
		const buffer = audioBuffer.buffer;
		audioBuffer = audioContext.createBuffer(
			1,
			audioBuffer.buffer.length,
			audioBuffer.sampleRate
		);
		audioBuffer.getChannelData(0).set(buffer);
	}
	const source = audioContext.createBufferSource();
	source.buffer = audioBuffer;
	const gainNode = audioContext.createGain();
	gainNode.gain.value = volume;
	source.connect(gainNode);
	gainNode.connect(audioContext.destination);
	source.start();
}

/**
 * @param {AudioBuffer | RawData} audioBuffer 
 * @returns {RawData}
 */
function parseAudioBuffer(audioBuffer) {
	if (audioBuffer instanceof RawData) return audioBuffer;
	// Grab averaged data
	const averagedChannelData = new Float32Array(audioBuffer.length);
	const numChannels = audioBuffer.numberOfChannels
	for (let channelInd = 0; channelInd < numChannels; ++channelInd) {
		let curChannel = audioBuffer.getChannelData(channelInd);
		for (let i = 0; i < averagedChannelData.length; ++i) {
			averagedChannelData[i] += curChannel[i];
		}
	}
	for (let i = 0; i < averagedChannelData.length; ++i) {
		averagedChannelData[i] /= numChannels;
	}
	return new RawData(
		averagedChannelData,
		audioBuffer.sampleRate,
		audioBuffer.duration,
	);
}
/**
 * @param {string} rawDataString 
 */
function stringToRawData(rawDataString) {
	let rawDataJSON = JSON.parse(rawDataString);
	return new RawData(
		Float32Array.from(Object.values(rawDataJSON.buffer)),
		rawDataJSON.sampleRate,
		rawDataJSON.duration
	);
}

/**
 * @param {Array} array 
 * @param {Chart} chart
 * @param {string} datasetLabel
 */
 function plotArray(array, chart, datasetLabel) {
	chart.data.datasets.forEach((dataset) => {
		if (dataset.label == datasetLabel) {
			console.log("plotting")
			dataset.data = new array.constructor(array.length);
			for (let i = 0; i < array.length; ++i) {
				dataset.data[i] = array[i];
				if (chart.data.labels.length <= i) {
					chart.data.labels[i] = i;
				}
			}
		}
	});
	chart.update();
}

/**
 * @param {Float32Array} frequencies1 
 * @param {Float32Array} frequencies2 
 * @returns {{normalized1: Float32Array, normalized2: Float32Array}}
 */
function normalizeFrequencyArray(frequencies1, frequencies2) {
	let n1 = trim(NormalizeArray(frequencies1));
	let n2 = trim(NormalizeArray(frequencies2));

	n2 = n2.length < n1.length ? NormalizeTime(n2, n1) : n2;
	n1 = n2.length < n1.length ? n1 : NormalizeTime(n2, n1);
	return {
		normalized1: n1,
		normalized2: n2
	}
}

/**
 * @param {Float32Array} frequencies1 
 * @param {Float32Array} frequencies2 
 * @return {{co: {number}, mse:{number}}}
 */
function getCoAndMSE(frequencies1, frequencies2) {
	const SplineArray1 = getSplineFromArray(frequencies1, 0.01);
	const smoothed1 = evaluateSplineArray(SplineArray1, 0, frequencies1.length);

	const SplineArray2 = getSplineFromArray(frequencies2, 0.01);
	const smoothed2 = evaluateSplineArray(SplineArray2, 0, frequencies2.length);

	return {
		co: correlationCoe(smoothed2, smoothed1),
		mse: MSE(smoothed1, smoothed2)
	};
}