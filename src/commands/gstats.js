const { Command } = require("discord-akairo");
const Discord = require("discord.js");

class GlobalStatsCommand extends Command {
	constructor() {
		super("gstats", {
			aliases: ["gstats", "globalstats"],
			description: "Checks the global statistics"
		});
	}

	async exec(message) {
		const [{ presentsFound }] = await this.client.knex("foundPresents")
			.countDistinct("presentCode", { as: "presentsFound" });

		const [{ wrongGuesses }] = await this.client.knex("userData")
			.sum({ wrongGuesses: "wrongGuesses"} );

		const [{ usersWithPresents }] = await this.client.knex("foundPresents")
			.countDistinct("userID", { as: "usersWithPresents" });

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";


		const gstatsEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Global Statistics")
			.addField("Presents:", "Total presents found: " + presentsFound)
			.addField("Stats:", "Wrong guesses: " + wrongGuesses + "\nUsers playing: " + usersWithPresents);

		message.channel.send(gstatsEmbed);
	}
}

module.exports = GlobalStatsCommand;
