const { Command } = require("../Command");

class AchievementCommand extends Command {
	constructor() {
		super("ach", {
			aliases: ["ach", "achievements"],
			description: "Checks your achievements"
		});
	}
	/**
	 * @param {import("discord.js").Message} message
	 */
	async exec(message) {
		await message.channel.send("<achievements go here>");
	}
}

module.exports = AchievementCommand;
