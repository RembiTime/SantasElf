const { Command } = require("discord-akairo");
const { partition } = require("../util/array");
const { showPages } = require("../util/discord");
const { MessageEmbed } = require("discord.js");

class AchievementCommand extends Command {
	constructor() {
		super("ach", {
			aliases: ["ach", "achievements"],
			description: "Checks your achievements"
		});
	}

	async exec(message) {
		const userData = await this.client.database.userDataCheck({ userID: message.author.id });

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const page1 = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Achievements")
			.setFooter("Page 1")
			let checkach = await this.client.database.checkAchievement({ name: "presentTotal", userID: message.author.id });
			if (checkach) {
				page1.addField("Christmas Spirit", "🟩🟥🟥🟥🟥🟥")
			} else {
				page1.addField("Christmas Spirit", "🟥🟥🟥🟥🟥🟥")
			}

		const page2 = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Achievements")
			.setFooter("Page 2")

		// .setFooter(`Page ${i + 3}`)

		const pages = [page1, page2];

		showPages(pages, message.channel, message.author, 120000);
	}
}

module.exports = AchievementCommand;
