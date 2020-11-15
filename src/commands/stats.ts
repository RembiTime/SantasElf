import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { showPages } from "../util/discord";

class StatsCommand extends Command {
	constructor() {
		super("stats", {
			aliases: ["stats", "statistics"],
			description: "Checks the statistics"
		});
	}

	/**
	 *
	 * @param {import("discord.js").Message} message
	 */
	async exec(message) {
		const [{ presentsFound }] = await this.client.knex("foundPresents")
			.countDistinct("presentCode", { as: "presentsFound" });

		const [{ wrongGuesses }] = await this.client.knex("userData")
			.sum({ wrongGuesses: "wrongGuesses"} );

		const [{ usersWithPresents }] = await this.client.knex("foundPresents")
			.countDistinct("userID", { as: "usersWithPresents" });

		const userPresents = (await Promise.all([1, 2, 3, 4, 5].map(async x =>
			await this.client.knex("userData").sum(`lvl${x}Total`, { as: `userLvl${x}Presents` }).where({userID: message.author.id})))).map((x,i) => x[`userLvl${i+1}Presents`]);

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const uStatsEmbed = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("User Statistics")
			.addField("Presents:", "Total level 1 presents found: " + userPresents[0] + "\nTotal level 2 presents found: " + userPresents[1] + "\nTotal level 3 presents found: " + userPresents[2] + "\nTotal level 4 presents found: " + userPresents[3] + "\nTotal level 5 presents found: " + userPresents[4]);


		const gstatsEmbed = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Global Statistics")
			.addField("Presents:", "Total presents found: " + presentsFound)
			.addField("Stats:", "Wrong guesses: " + wrongGuesses + "\nUsers playing: " + usersWithPresents);

		const pages = [uStatsEmbed, gstatsEmbed];

		showPages(pages, message.channel, message.author, 120000);
	}
}

export = StatsCommand;
