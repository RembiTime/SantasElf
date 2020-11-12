const { Command } = require("discord-akairo");
const { partition } = require("../util/array");
const { showPages } = require("../util/discord");
const { MessageEmbed } = require("discord.js");
const achievements = require("../achievements");

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

		let completeSquares = (await Promise.all([1, 2, 3, 4].map(x => this.client.database.checkAchievement({ name: `serverPresents${x}`, userID: message.author.id })))).map(Number);
		let achProgress = completeSquares.findIndex(0);
		let achName = achievements.find(ach => ach.keyID === "serverPresents");
		completeSquares.map(x=>x ? "🟩" : "🟥");

		const page1 = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Achievements")
			.setFooter("Page 1")
			.addField(completeSquares);


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
