const { Command } = require("discord-akairo");
const items = require("../items");

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
		const newUserCheck = this.client.database.userDataCheck({userID: message.author.id});
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
			if (item.id === "mistletoe") {
				const itemCheck = this.client.database.userHasItem({userID: message.author.id, itemName: "mistletoe"});
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				}
				this.client.database.useMistletoe({message: message});
			}
			if (item.id === "meme") {
				const itemCheck = await this.client.database.itemCheck({userID: message.author.id, itemName: "meme"});
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				}
				this.client.database.useMeme({message: message});
			}
		} else {
			message.channel.send("That item does not exist!");
		}
	}
}

module.exports = UseCommand;
