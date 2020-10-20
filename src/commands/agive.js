const { Command } = require("discord-akairo");

class AdminGiveCommand extends Command {
	constructor() {
		super("agive", {
			aliases: ["agive"],
			description: "Gives a present",
			ownerOnly: true,
			args: [{
				id: "presentLevel",
				type: "string"
			}]
		});
	}

	async exec(message, {presentLevel}) {
		const userData = await this.client.database.userDataCheck({ userID: message.author.id });
		this.client.database.agivePresent({ message: message, userID: message.author.id, presentLevel: presentLevel});
}
}

module.exports = AdminGiveCommand;
