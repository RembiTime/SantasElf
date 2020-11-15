const { Command } = require("discord-akairo");

class DeleteCommand extends Command {
	constructor() {
		super("delete", {
			aliases: ["del", "delete"],
			description: "Delete a code"
		});
	}
	async exec(message) {
		if (!message.member.hasPermission("ADMINISTRATOR")) {
			await message.channel.send("You must have administrator permissions in this server to use this command!");
		}

	}
}

module.exports = DeleteCommand;
