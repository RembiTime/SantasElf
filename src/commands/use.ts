import { Command } from "discord-akairo";
import { items } from "../items";

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

	async exec(message, { itemName }) {
		const newUserCheck = this.client.database.userDataCheck({ userID: message.author.id });
		if (newUserCheck === null) {
			await this.client.database.addNewUser({
				userID: message.author.id,
				userName: message.member.user.tag
			});
		}

		const item = items.find(item => item.id === itemName || item.displayName === itemName);
		if (item && "worth" in item) {
			message.channel.send("This item can't be used! Try `,sell`ing it instead.");
			return;
		} else if (item && "rank" in item) {
			if (item.id === "fractal" || item.id === "slime" || item.id === "spanner" || item.id === "dragon" || item.id === "mysteriousPart") {
				message.channel.send("You can't use that item... Maybe you have to build something with it?");
				return;
			}
			if (item.id === "mistletoe") {
				const itemCheck = await this.client.database.itemCheck({userID: message.author.id, itemName: "mistletoe"});
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				}
				this.client.database.useMistletoe({ message: message });
			}
			else if (item.id === "meme") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "meme" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				}
				this.client.database.useMeme({ message: message });
			}
			else if (item.id === "palette") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "palette" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				} if (this.client.minigamePlayers.has(message.author.id)) {
					message.channel.send("There is already an ongoing game! Please finish that first");
					return;
				}
				this.client.database.usePalette({ message: message });
			}
			else if (item.id === "watch") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "watch" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				} if (this.client.minigamePlayers.has(message.author.id)) {
					message.channel.send("There is already an ongoing game! Please finish that first");
					return;
				}
				this.client.database.useWatch({ message: message });
			}
			else if (item.id === "role") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "role" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				} if (message.guild.id !== "647915068767338509") {
					message.channel.send("Please send this command SMPEarth Discord to use this item. https://discord.gg/y5BfFjP")
				}
			}
		} else {
			message.channel.send("That item does not exist!");
		}
	}
}

export = UseCommand;
