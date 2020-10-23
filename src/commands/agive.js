const { Argument, Command } = require("discord-akairo");

class AdminGiveCommand extends Command {
	constructor() {
		super("agive", {
			aliases: ["agive"],
			description: "Gives a present",
			ownerOnly: true,
			args: [
				{
					id: "user",
					type: "user"
				},
				{
					id: "presentLevel",
					type: Argument.range("integer", 1, 5, true)
				},
				{
					id: "amount",
					type: "integer"
				}
			]
		});
	}

	async exec(message, { user, presentLevel, amount }) {
		this.client.database.agivePresent({ userID: user.id, message: message, presentLevel: presentLevel, amount: amount });
	}
}

module.exports = AdminGiveCommand;
