const { Command } = require("discord-akairo");
const Discord = require('discord.js');

class InventoryCommand extends Command {
	constructor() {
		super("inventory", {
			aliases: ["inventory","inv"],
			description: "Checks your inventory"
		});
	}

	async exec(message) {
		const userData = await this.client.database.findIfFirstPresent({ userID: message.author.id });
		let hexColor = ''
		let randomNum = Math.floor(Math.random() * Math.floor(2));
		if (randomNum == 0 ) {
			hexColor = '#FF5A5A'
		} else {
			hexColor = '#8DFF5A'
		}
		const inventoryEmbed = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle('Your inventory')
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addField('Presents:', "You've found " + userData.totalPresents + " presents!")
			.addField('Stats:', "You've guessed incorrectly " + userData.wrongGuesses + " times!\nYou've found the present first " + userData.firstFinder + " times!")

message.channel.send(inventoryEmbed);
	}
}

module.exports = InventoryCommand;
