const { Command } = require("discord-akairo");
const Discord = require("discord.js");

class InventoryCommand extends Command {
	constructor() {
		super("inventory", {
			aliases: ["inventory", "inv"],
			description: "Checks your inventory"
		});
	}

	async exec(message) {
		const userData = await this.client.database.findIfFirstPresent({ userID: message.author.id });
		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const inventoryEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Your inventory")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addField("Presents:", "You've found " + userData.totalPresents + " presents!")
			.addField("Stats:", "You've guessed incorrectly " + userData.wrongGuesses + " times!\nYou've found the present first " + userData.firstFinder + " times!");

		message.channel.send(inventoryEmbed);
	}
}

module.exports = InventoryCommand;
