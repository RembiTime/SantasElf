import { Command } from "discord-akairo";
import { items } from "../items";

class SellCommand extends Command {
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
		if (!item) {
			await message.channel.send("That item does not exist!");
			return;
		}

		if (item.id === "fractal" || item.id === "slime" || item.id === "spanner" || item.id === "dragon" || item.id === "mysteriousPart") {
			message.channel.send("You can't sell that item... Maybe you have to build something with it?");
			return;
		}
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
			message.channel.send("This item can't be sold! Try `,use`ing it instead.");
		} else {
			message.channel.send("This item does not exist!");
		}
	}
}

export = SellCommand;
