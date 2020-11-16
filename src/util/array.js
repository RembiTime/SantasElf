/**
 * @template T, U
 * @param {(item: U) => T} valueOf 
 * @param {U[]} array 
 * @returns {U[][]}
 */
const partition = (valueOf, array) => {
	const subsets = new Map();

	for (const elem of array) {
		const value = valueOf(elem);
		if (subsets.has(value)) {
			subsets.get(value).push(elem);
		} else {
			subsets.set(value, [elem]);
		}
	}

	return [...subsets.values()];
};

/**
 * Inclusive on the min, exclusive on the max
 *
 * @param {number} min
 * @param {number} max
 * @returns {number[]}
 */
const range = function(min, max) {
	const result = Array(max - min);

	for (let i = 0; i < result.length; i++) {
		result[i] = i + min;
	}

	return result;
};

module.exports = { partition, range };
