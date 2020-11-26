export const partition = <T>(valueOf: (value: T) => unknown, array: T[]): T[][] => {
	const subsets = new Map<unknown, T[]>();

	for (const elem of array) {
		const value = valueOf(elem);
		if (subsets.has(value)) {
			subsets.get(value)!.push(elem);
		} else {
			subsets.set(value, [elem]);
		}
	}

	return [...subsets.values()];
};
export const chunk = <T>(arr: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
	return chunks;
};
/**
 * Inclusive on the min, exclusive on the max
 */
export const range = function(min: number, max: number): number[] {
	const result = Array(max - min);
	return result.fill(0).map((x, i) => i + min);
};
