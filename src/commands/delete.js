const { Command } = require("../Command");

class DeleteCommand extends Command {
	constructor() {
		super("delete", {
			aliases: ["del", "delete"],
			description: "Delete a code"
		});
	}
	async exec(message) {

	if (!member.hasPermission('ADMINISTRATOR')) {
		message.channel.send("You must have administrator permissions in this server to use this command!")
	}

	}
}

module.exports = DeleteCommand;
