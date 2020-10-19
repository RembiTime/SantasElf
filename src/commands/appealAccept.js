const { Command } = require("discord-akairo");

class AppealAcceptCommand extends Command {
	constructor() {
		super("appealAccept", {
			aliases: ["appealAccept", "aa"],
			description: "Accept a 3 denied appeal",
			ownerOnly: true,
			args: [{
				id: "guildID",
				type: "string"
			}]
		});
	}

	async exec(message, { guildID }) {
		const guildData = await this.client.database.checkNewGuild({guildID});
		if (guildData === null) {
			message.channel.send("This guild does not exist");
			return;
		}
		if (guildData.appealed3Deny) {
			message.channel.send("This server has already appealed.");
			return;
		}
		this.client.database.appealAccept({guildID});
		message.channel.send("This guild has been given 2 more attempts");
	}
}

module.exports = AppealAcceptCommand;
