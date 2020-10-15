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
		const globalStats = await this.client.database.getGlobalStats();
		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const gstatsEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Global Statistics")
			.addField("Presents:", "Total presents found: " + globalStats.presentsFound)
			.addField("Stats:", "Wrong guesses: " + globalStats.wrongGuesses + "\nUsers playing: " + globalStats.usersWithPresents);

		message.channel.send(gstatsEmbed);
	}
}

module.exports = GlobalStatsCommand;
