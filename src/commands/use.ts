import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { items } from "../items";

class UseCommand extends Command {
	constructor() {
		super("use", {
			aliases: ["use"],
			description: "(,use itemName) Uses an item",
			channel: "guild",
			args: [{
				id: "itemName",
				type: "string"
			}]
		});
	}

	async exec(message: Message, { itemName }) {
		await message.author.ensureDB();

		const item = items.find(item => item.id === itemName || item.displayName === itemName);

		if (!item) {
			!message.channel.send("That item does not exist!");
			return;
		}

		const userItem = await message.author.fetchItem(item);

		if (!userItem || userItem.amount <= 0) {
			await message.channel.send("You don't have any of that item");
		} else if (typeof item.use === "function") {
			await item.use(message);
		} else if (typeof item.worth === "number") {
			await message.channel.send("This item can't be used! Try `sell`ing it instead.");
		} else if (["fractal", "slime", "spanner", "dragon", "mysteriousPart"].includes(item.id)) {
			this.client.database.addLog(message.author.tag + " tried to sell a special item (" + item.id + ")");
			await message.channel.send("You can't use that item... Maybe you have to build something with it?");
		} else {
			await message.channel.send("This item can't be used!");
		}
	}
}

export = UseCommand;
