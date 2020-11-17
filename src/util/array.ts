export const partition = <T>(valueOf: (value: T) => unknown, array: T[]): T[][] => {
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
 */
export const range = function(min: number, max: number): number[] {
	const result = Array(max - min);

	for (let i = 0; i < result.length; i++) {
		result[i] = i + min;
	}

	return result;
};
