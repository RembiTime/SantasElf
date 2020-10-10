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
		let serverID = message.guild.id;
		let serverName = message.guild.name;
		let channelID = message.channel.id;
		let channelName = message.channel.name;
		let userID = message.author.id;
		let userName = message.member.user.tag;
		let tspecs = { code: code, presentLevel: level, timesFound: 0, serverName: `${serverName}`, serverID: serverID, channelName: `${channelName}`, channelID: channelID, hiddenByName: `${userName}`, hiddenByID: userID };
		this.client.database.query("INSERT INTO presents SET ?", tspecs, (err, result) => {
			message.channel.send("Created a present with the code of `" + code + "` and a difficulty of `" + level + "`.");
			if (err) throw err;
			console.log(result);
		});
	}
}

module.exports = HideCommand;
