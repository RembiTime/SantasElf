/**
 * @typedef {object} AchievementEntry
 * @property {string} id
 * @property {AchievementTier[]} tiers
 */

/**
 * @typedef {object} AchievementTier
 * @property {string} displayName
 * @property {string} description
 * @property {{ type: "present", level: number } | { type: "candyCanes", amount: number }} prize
 * @property {OnFindType?} onFind
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
		id: "presentTotal",
		// TODO
		tiers: [
			{
				displayName: "Christmas spirit",
				description: "Find your first present!",
				prize: { type: "present", level: 1 }
			}
		]
	},
	{
		id: "uniquePresents",
		//TODO
		tiers: [
			{
				displayName: "Christmas spirit",
				description: "Find your first present!",
				prize: { type: "present", level: 1 }
			}
		]
	},
	{
		id: "1stCategory",
		tiers: [
			{
				displayName: "Down on your luck",
				description: "Get a grinch/negative item",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "Ruler of rubbish",
				description: "Get a snowflake/common item",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "Master of mediocrity",
				description: "Get a snowman/uncommon item",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "PLACEHOLDER",
				description: "Get an elf/rare item",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "Lord of legendary",
				description: "Get a reindeer/legendary item",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "Master of mythic",
				description: "Get a Santa/mythic item",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "Acculmulator of anomalies",
				description: "Get a Rudolf/unique item",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "Diverse collector",
				description: "Get at least one item in each rarity",
				prize: { type: "present", level: 3 }
			}
		]
	},
	{
		id: "serverPresents",
		tiers: [
			{
				displayName: "Adventurer",
				description: "Find presents in 5 different servers",
				prize: { type: "present", level: 1 }
			},
			{
				displayName: "Explorer",
				description: "Find presents in 10 different servers",
				prize: { type: "present", level: 2 }
			},
			{
				displayName: "Tourist",
				description: "Find presents in 20 different servers",
				prize: { type: "present", level: 3 }
			},
			{
				displayName: "Extrovert",
				description: "Find presents in 50 different servers",
				prize: { type: "present", level: 4 }
			}
		]
	},
	{
		id: "minigamesPlayed",
		//TODO
		tiers: [
			{
				displayName: "Let the games begin!",
				description: "Play your first minigame",
				prize: { type: "present", level: 1 }
			}
		]
	},
	{
		id: "everyMinigame",
		tiers: [{
			displayName: "True gamer at heart",
			description: "Play every minigame",
			prize: { type: "present", level: 5 }
		}]
	},
	{
		id: "sellItems",
		//TODO
		tiers: [
			{
				displayName: "Salesman",
				description: "Sell your first item",
				prize: { type: "present", level: 1 }
			}
		]
	},
	{
		id: "sellAll",
		tiers: [{
			displayName: "Business man doing business",
			description: "Sell every item",
			prize: { type: "present", level: 5 },
		}]
	},
	{
		id: "findGoose",
		tiers: [{
			displayName: "HONK!",
			description: "Find a devilish goose",
			prize: { type: "candyCanes", amount: 20 }
		}]
	},
	{
		id: "findClothing",
		tiers: [{
			displayName: "Covered head to toe",
			description: "Find all pieces of clothing",
			prize: { type: "present", level: 2 },
		}]
	},
	{
		id: "findFootballs",
		tiers: [{
			displayName: "Yay! Sportsball!",
			description: "Find both footballs",
			prize: { type: "present", level: 2 }
		}]
	},
	{
		id: "findGamerstuff",
		tiers: [{
			displayName: "Sponsored by mountain dew",
			description: "Find everything you need to become a true gamer",
			prize: { type: "present", level: 4 }
		}]
	},
	{
		id: "findPets",
		tiers: [{
			displayName: "Expanded family",
			description: "Find both the pets",
			prize: { type: "present", level: 3 }
		}]
	},
	{
		id: "findDevs",
		tiers: [{
			displayName: "Meet the makers",
			description: "Find all the dev-inspired items",
			prize: { type: "present", level: 5 }
		}]
	},
	{
		id: "findOwner",
		tiers: [{
			displayName: "PLACEHOLDER",
			description: "Become the owner of SMPEarth",
			prize: { type: "present", level: 3 }
		}]
	},
	{
		id: "findGlitch",
		tiers: [{
			displayName: "YoU BrOkE EvErYtHiNg",
			description: "Find a glitch",
			prize: { type: "present", level: 5 }
		}]
	},
	{
		id: "findCorn",
		tiers: [{
			displayName: "aMAZEing",
			description: "Find the best item in the game: The legendary corn",
			prize: { type: "present", level: 5 }
		}]
	},
	{
		id: "createTriangle",
		tiers: [{
			displayName: "Mechanic",
			description: "Construct a mysterious object",
			prize: { type: "present", level: 5 }
		}]
	}
];
