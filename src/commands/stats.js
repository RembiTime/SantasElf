const { Command } = require("discord-akairo");
const { showPages } = require("../util/discord");
const Discord = require("discord.js");

class StatsCommand extends Command {
	constructor() {
		super("stats", {
			aliases: ["stats", "statistics"],
			description: "Checks the statistics"
		});
	}

	async exec(message) {
		const [{ presentsFound }] = await this.client.knex("foundPresents")
			.countDistinct("presentCode", { as: "presentsFound" });

		const [{ wrongGuesses }] = await this.client.knex("userData")
			.sum({ wrongGuesses: "wrongGuesses"} );

		const [{ usersWithPresents }] = await this.client.knex("foundPresents")
			.countDistinct("userID", { as: "usersWithPresents" });

			const userPresents = (await Promise.all([1, 2, 3, 4, 5].map(x =>
				await this.client.knex("userData").sum(`lvl${x}Total`, { as: `userLvl${x}Presents` }).where({userID: message.author.id})))).map((x,i) => x[`userLvl${i+1}Presents`]);

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const uStatsEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("User Statistics")
			.addField("Presents:", "Total level 1 presents found: " + userPresents[0] + "\nTotal level 2 presents found: " + userPresents[1] + "\nTotal level 3 presents found: " + userPresents[2] + "\nTotal level 4 presents found: " + userPresents[3] + "\nTotal level 5 presents found: " + userPresents[4]);


		const gstatsEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Global Statistics")
			.addField("Presents:", "Total presents found: " + presentsFound)
			.addField("Stats:", "Wrong guesses: " + wrongGuesses + "\nUsers playing: " + usersWithPresents);

		const pages = [uStatsEmbed, gstatsEmbed];

		showPages(pages, message.channel, message.author, 120000);
	}
}

module.exports = StatsCommand;
