const { Command } = require("discord-akairo");

class AdminGiveCommand extends Command {
	constructor() {
		super("agive", {
			aliases: ["agive"],
			description: "Gives a present",
			ownerOnly: true,
			args: [
				{
					id: "presentLevel",
					type: "string"
				},
				{
					id: "amount",
					type: "integer"
				}
			]
		});
	}

	async exec(message, {presentLevel, amount}) {
		this.client.database.agivePresent({ message: message, userID: message.author.id, presentLevel: presentLevel, amount: amount});
	}
}

module.exports = AdminGiveCommand;
