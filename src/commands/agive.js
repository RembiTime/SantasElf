const { Command } = require("discord-akairo");

class AdminGiveCommand extends Command {
	constructor() {
		super("agive", {
			aliases: ["agive"],
			description: "Gives a present",
			ownerOnly: true,
			args: [
				{
					id: "userID",
					type: "string"
				},
				{
					id: "presentLevel",
					type: "integer"
				},
				{
					id: "amount",
					type: "integer"
				}
			]
		});
	}

	async exec(message, {userID, presentLevel, amount}) {
		this.client.database.agivePresent({ userID: userID, message: message, presentLevel: presentLevel, amount: amount});
	}
}

module.exports = AdminGiveCommand;
