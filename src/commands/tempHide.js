const { Command } = require("discord-akairo");

class TempHideCommand extends Command {
	constructor() {
		super("tempHide", {
			aliases: ["tempHide", "th"],
			description: "Hide a present with a limited number of uses!",
			ownerOnly: true,
			args: [
				{
					id: "code",
					type: "string"
				},
				{
					id: "level",
					type: "integer",
					prompt: { start: "Please enter a difficulty level between 1-3 (1-5 if you're a partner)", retry: "The difficulty must be a number between 1 and 3 (1 and 5 if you're a partner)" }
				},
				{
					id: "uses",
					type: "integer",
					prompt: { start: "Please enter the amount of uses this code has", retry: "Please enter the amount of uses this code has" }
				}
			]
		});
	}

	async exec(message, { code, level, uses }) {
		const present = await this.client.database.getPresent({ code: code });

		if (present !== null) {
			message.channel.send("That code already exists!");
			return;
		}

		await this.client.database.addPresent({
			code: code,
			presentLevel: level,
			timesFound: 0,
			guildID: null,
			channelID: null,
			hiddenByID: message.author.id,
			usesLeft: uses
		});
		message.channel.send("Added the code " + code + " with " + uses + " uses!");
	}
}

module.exports = TempHideCommand;
