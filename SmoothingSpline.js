class Spline {
	/** @type {number} */ a;
	/** @type {number} */ b;
	/** @type {number} */ c;
	/** @type {number} */ d;
	/** @type {number} */ x;
	/** @type {number} */ y;

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.a = 0;
		this.b = 0;
		this.c = 0;
		this.d = 0;
	}

	/**
	 * @param {number} x 
	 * @returns {number}
	 */
	evaluate(x) {
		let relX = x - this.x;
		let xSq = relX * relX;
		let y =
			this.a * xSq * relX +
			this.b * xSq +
			this.c * relX +
			this.d;
		return y;
	}
}

/**
 * @param {Spline[]} S 
 * @param {[]} sigma 
 * @param {number} lambda 
 * @param {number} n 
 */
function SmoothingSpline(S, sigma, lambda, n) {
	let h = [], r = [], f = [], p = [], q = [], u = [], v = [], w = [];

	let mu = 2 * (1 - lambda) / (3 * lambda);

	h[0] = S[1].x - S[0].x;
	r[0] = 3 / h[0];
	for (let i = 1; i < n; ++i) {
		h[i] = S[i + 1].x - S[i].x;
		r[i] = 3 / h[i];
		f[i] = -(r[i - 1] + r[i]);
		p[i] = 2 * (S[i + 1].x - S[i - 1].x);
		q[i] = 3 * (S[i + 1].y - S[i].y) / h[i] - 3 * (S[i].y - S[i - 1].y) / h[i - 1];
	}

	r[n] = 0;
	f[n] = 0;
	for (let i = 1; i < n; ++i) {
		u[i] = Math.pow(r[i - 1], 2) * sigma[i - 1] +
		       Math.pow(f[i], 2) * sigma[i] +
		       Math.pow(r[i], 2) * sigma[i + 1];
		u[i] = mu * u[i] + p[i];
		v[i] = f[i] * r[i] * sigma[i] +
		       r[i] * f[i + 1] * sigma[i + 1];
		v[i] = mu * v[i] + h[i];
		w[i] = mu * r[i] * r[i + 1] * sigma[i + 1];
	}
	
	Quincunx(n, u, v, w, q);

	S[0].d = S[0].y - mu * r[0] * q[1] * sigma[0];
	S[1].d = S[1].y - mu * (f[1] * q[1] + r[1] * q[2]) * sigma[0];
	S[0].a = q[1] / (3 * h[0]);
	S[0].b = 0;
	S[0].c = (S[1].d - S[0].d) / h[0] - q[1] * h[0] / 3;
	r[0] = 0;

	for (let i = 1; i < n; ++i) {
		S[i].a = (q[i + 1] - q[i]) / (3 * h[i]);
		S[i].b = q[i];
		S[i].c = (q[i] + q[i - 1]) * h[i - 1] + S[i - 1].c;
		S[i].d = r[i - 1] * q[i - 1] + f[i] * q[i] + r[i] * q[i + 1];
		// S[i].d = y[i] - mu * S[i].d * sigma[i];
		S[i].d = S[i].y - mu * S[i].d * sigma[i];
	}
}

/**
 * @param {number} n 
 * @param {[]} u 
 * @param {[]} v 
 * @param {[]} w 
 * @param {[]} q 
 */
function Quincunx(n, u, v, w, q) {

	u[0] = 0;
	// u[1] = u[1];

	v[0] = 0;
	v[1] = v[1] / u[1];

	w[0] = 0;
	w[1] = w[1] / u[1];
	
	for (let i = 2; i < n; ++i) {
		u[i] = u[i] - u[i - 2] * Math.pow(w[i - 2], 2) - u[i - 1] * Math.pow(v[i - 1], 2);
		v[i] = (v[i] - u[i - 1] * v[i - 1] * w[i - 1]) / u[i];
		w[i] = w[i] / u[i];
	}
	
	q[0] = 0;
	for (let i = 2; i < n; ++i) {
		q[i] = q[i] - v[i - 1] * q[i - 1] - w[i - 2] * q[i - 2];
	}
	for (let i = 1; i < n; ++i) {
		q[i] = q[i] / u[i];
	}
	
	q[n + 1] = 0;
	q[n] = 0;
	for (let i = n - 1; i >= 1; --i) {
		q[i] = q[i] - v[i] * q[i + 1] - w[i] * q[i + 2];
	}
}

/**
 * @param {number[]} buffer 
 * @param {number} THRESHOLD
 * @returns {Spline[]}
 */
function getSplineFromArray(buffer, THRESHOLD=47) {
	let SplineArray = [];
	for (let i = 0; i < buffer.length; ++i) {
		if (isFinite(buffer[i]) ) {
			SplineArray.push(new Spline(i, buffer[i]));
		}
	}
	if (SplineArray.length > 1) {
		const sigma = (new Uint8Array(SplineArray.length)).fill(1);
		// SmoothingSpline(SplineArray, sigma, 0.001, SplineArray.length - 1);
		SmoothingSpline(SplineArray, sigma, 0.95, SplineArray.length - 1);
		// SmoothingSpline(SplineArray, sigma, 1, SplineArray.length - 1);
		return SplineArray;
	}
	return [];
}