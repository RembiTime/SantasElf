const { Command } = require("discord-akairo");

class FoundCommand extends Command {
	constructor() {
		super("found", {
			aliases: ["found"],
			description: "Command to be used when you find a present",
			args: [{
				id: "code",
				type: "string"
			}]
		});
	}

	async exec(message, { code }) {
		const present = await this.client.database.getPresent({ code, serverID: message.guild.id });

		if (present === null) {
			message.channel.send("That present does not exist!");
			return;
		}

		this.client.database.incrementPresentFindCount(present.id);

		// TODO: fix this race condition
		if (present.timesFound === 0) {
			message.channel.send("You were the first one to find this present! It had a difficulty of `" + present.presentLevel + "`.");
		} else {
			message.channel.send("You just claimed the present! It had a difficulty of `" + present.presentLevel + "`.");
		}
	}
}

module.exports = FoundCommand;
