const partition = function(valueOf, array) {
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

module.exports = { partition };