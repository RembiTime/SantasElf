const { Command } = require("discord-akairo");

class HideCommand extends Command {
	constructor() {
		super("hide", {
			aliases: ["hide"],
			description: "Hide a present!",
			args: [
				{
					id: "code",
					type: "string"
				},
				{
					id: "level",
					type: "number"
				}
			]
		});
	}

	async exec(message, { code, level }) {
		await this.client.database.addPresent({
			code,
			presentLevel: level,
			timesFound: 0,
			serverName: message.guild.name,
			serverID: message.guild.id,
			channelName: message.channel.name,
			channelID: message.channel.id,
			hiddenByName: message.member.user.tag,
			hiddenByID: message.author.id
		});

		await message.channel.send("Created a present with the code of `" + code + "` and a difficulty of `" + level + "`.");
	}
}

module.exports = HideCommand;
