const { Command } = require("discord-akairo");
const Discord = require('discord.js');

class GlobalStatsCommand extends Command {
	constructor() {
		super("gstats", {
			aliases: ["gstats","globalstats"],
			description: "Checks the global statistics"
		});
	}

	async exec(message) {
		const globalStats = await this.client.database.getGlobalStats();
		let hexColor = ''
		let randomNum = Math.floor(Math.random() * Math.floor(2));
		if (randomNum == 0 ) {
			hexColor = '#FF5A5A'
		} else {
			hexColor = '#8DFF5A'
		}
		const gstatsEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle('Global Statistics')
			.addField('Presents:', "Total presents found: " + globalStats.presentsFound)
			.addField('Stats:', "Wrong guesses: " + globalStats.wrongGuesses + "\nUsers playing: " + globalStats.usersWithPresents)

message.channel.send(gstatsEmbed);
	}
}

module.exports = GlobalStatsCommand;
