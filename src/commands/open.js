const { Command } = require("discord-akairo");

class OpenCommand extends Command {
	constructor() {
		super("open", {
			aliases: ["open"],
			description: "Open a present!",
			args: [{
				id: "presentLevel",
				type: "string"
			}]
		});
	}

	/**
	 * @param {import("discord.js").Message} message
	 * @param {{ presentLevel: number }} args
	 */
	async exec(message, {presentLevel}) {

		const newUserCheck = await this.client.database.userDataCheck({ userID: message.author.id });

		if (newUserCheck === null) {
			await this.client.database.addNewUser({
				userID: message.author.id,
				userName: message.author.tag
			});
		}

		const userData = await this.client.database.userDataCheck({ userID: message.author.id });
		const presentCheck = await this.client.database.removePresent({userData: userData, presentLevel: presentLevel});
		if (presentCheck == 0) {
			message.channel.send("You don't have any level " + presentLevel + " presents to open!");
			return;
		} if (presentCheck == 2) {
			message.channel.send("There are no presents with the level `" + presentLevel + "`");
			return;
		}
		this.client.database.choosePresent({ message: message, presentLevel: presentLevel, userID: message.author.id});
	}
}

module.exports = OpenCommand;
