/**
 * @typedef {object} AchievementEntry
 * @property {string} id
 * @property {displayName} displayName
 * @property {displayName} description
 * @property {number} tiers
 * @property {OnFindType} onFind
 */

/**
  * @callback OnFindType
  * @param client
  * @param message
  * @returns {Promise<void>}
  */

/**
 * @type {AchievementEntry[]}
 */

module.exports = [
	{
		id: "tester",
		displayName: "Tester",
		prize: "lvl1Present",
		tiers: 3,
		tierLvls: [5, 10, 20],
		description: "How did you get this?"
	}
];
