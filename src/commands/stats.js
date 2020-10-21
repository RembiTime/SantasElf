const { Command } = require("discord-akairo");
const Discord = require("discord.js");

class StatsCommand extends Command {
	constructor() {
		super("stats", {
			aliases: ["stats"],
			description: "Checks your statistics"
		});
	}

	//This will be seperate from the inventory page with statistics instead of how many presents

	async exec(message) {
		const userData = await this.client.database.userDataCheck({ userID: message.author.id });

		if (userData === null) {
			await this.client.database.addNewUser({
				userID: message.author.id,
				userName: message.member.user.tag
			});
		}
		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const statsEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("User Stats")
			.setFooter("Page 1/2")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addField("Presents:", "You've found " + userData.totalPresents + " presents!")
			.addField("Stats:", "You've guessed incorrectly " + userData.wrongGuesses + " times!\nYou've found the present first " + userData.firstFinder + " times!");

		await message.channel.send(statsEmbed);
	}
}

module.exports = StatsCommand;
