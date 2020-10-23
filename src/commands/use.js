const { Command } = require("discord-akairo");
const items = require("../items");
const Discord = require("discord.js")

class UseCommand extends Command {
	constructor() {
		super("use", {
			aliases: ["use"],
			description: "Use an item",
			args: [{
				id: "itemName",
				type: "string"
			}]
		});
	}

	async exec(message, {itemName}) {
		const item = items.find(item => item.id === itemName || item.displayName === itemName);
		if (item && "worth" in item) {
			message.channel.send("This item can't be used! Try `,sell`ing it instead.");
			return;
		} else if (item && "rank" in item) {
			if (item.id === "mistletoe") {
				message.channel.send("Who would you like to kiss?");
				const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 120000 });
				collector.on("collect", message => {
					let kissedID = message.mentions.users.first().id;
					message.reply.send("<@" + message.author.id + "> kissed <@" + kissedID + ">! Congrats!");
					this.client.database.addCandyCanes({amount: 20, userID: message.author.id});
				});
			}
		}
	}
}

module.exports = UseCommand;
