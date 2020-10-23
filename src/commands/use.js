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
				const promptMessage = await message.channel.send("Who would you like to kiss?");
				const userID = await message.author.id;
				message.delete();
				const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 120000 });
				collector.on("collect", message => {
					if (message.mentions.users.size === 1) {
						let kissedID = message.mentions.users.first().id;
						if (userID === kissedID) {
							message.channel.send("You can't kiss yourself!");
							return;
						}
						message.delete();
						promptMessage.delete();
						message.channel.send("<@" + message.author.id + "> kissed <@" + kissedID + ">! Congrats! (Also, take 20 candy canes each)");
						this.client.database.removeItem({itemName: "mistletoe", userID: message.author.id});
						this.client.database.addCandyCanes({amount: 20, userID: message.author.id});
						this.client.database.addCandyCanes({amount: 20, userID: kissedID});
						return;
					} else if (message.mentions.users.size > 1) {
						message.channel.send("Please mention only one user");
						return;
					} else {
						message.channel.send("Please mention a user to kiss!");
						return;
					}
				});
			}
		}
	}
}

module.exports = UseCommand;
