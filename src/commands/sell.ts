import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { items } from "../items";

class SellCommand extends Command {
	constructor() {
		super("sell", {
			aliases: ["sell"],
			description: "(,sell itemName) Sells an item",
			args: [{
				id: "itemName",
				type: "string"
			}]
		});
	}


	async exec(message: Message, {itemName}) {
		await message.author.ensureDB();
		const item = items.find(item => item.id === itemName || item.displayName === itemName);
		if (!item) {
			await message.channel.send("That item does not exist!");
			return;
		}

		if (item.id === "fractal" || item.id === "slime" || item.id === "spanner" || item.id === "dragon" || item.id === "mysteriousPart") {
			this.client.database.addLog(`${message.author.tag} tried to sell a special item (${item.id})`);
			message.channel.send("You can't sell that item... Maybe you have to build something with it?");
			return;
		}
		if (item && "worth" in item) {
			const userItem = await message.author.fetchItem(item);

			if (userItem && userItem.amount > 0) {
				await this.client.database.addCandyCanes({amount: item.worth, userID: message.author.id});
				await this.client.database.removeItem({itemName: item.id, userID: message.author.id});
				const [ccAmt] = await this.client.knex("userData").select("candyCanes").where({userID: message.author.id});
				this.client.database.addLog(`${message.author.tag} sold a(n) ${item.id}. They now have ${ccAmt.candyCanes} candy canes`);
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
