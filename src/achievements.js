/**
 * @typedef {object} AchievementEntry
 * @property {string} id
 * @property {displayName} displayName
 * @property {displayName} description
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
		description: "How did you get this?"
	}
];
