const { Command } = require("discord-akairo");
const items = require("../items");

class PingCommand extends Command {
	constructor() {
		super("sell", {
			aliases: ["sell"],
			description: "Sell an item",
			args: [{
				id: "itemName",
				type: "string"
			}]
		});
	}

	async exec(message, {itemName}) {
		const item = items.find(item => item.id === itemName || item.displayName === itemName);
		if (item && "worth" in item) {
			const itemCheck = await this.client.database.userHasItem({userID: message.author.id, itemName: item.id});
			if (itemCheck === true) {
				this.client.database.addCandyCanes({amount: item.worth, userID: message.author.id});
				this.client.database.removeItem({itemName: item.id, userID: message.author.id});
				message.channel.send("You sold " + item.messageName + " for " + item.worth + " candy canes");
				return;
			} else {
				message.channel.send("You don't have any of this item");
				return;
			}
		} else if (item && "rank" in item) {
			message.channel.send("This item can't be sold! Try `,use`ing it.");
		} else {
			message.channel.send("This item does not exist!");
		}
	}
}

module.exports = PingCommand;
