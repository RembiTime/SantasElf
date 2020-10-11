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
		const present = await this.client.database.getPresent({ code, serverID: message.guild.id });
		const checkNewServer = await this.client.database.checkNewServer({ code, serverID: message.guild.id });
		const globalStats = await this.client.database.getGlobalStats();
		let newServer = false;
		if (present !== null) {
			message.channel.send("That code already exists!");
			return;
		}
		if (checkNewServer === null) {
			this.client.database.incrementGlobalGuildsWithPresents();
			newServer = true;
			}
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
		if (newServer == true) {
			console.log("'" + message.guild.name + "' just created their first present! There are now " + globalStats.guildsWithPresents + " servers participating!")
		} else { //TODO: add amount of presents in a server
			console.log("'" + message.guild.name + "' just created a present! There are now " + globalStats.guildsWithPresents + " servers participating!")
		}
	}
}

module.exports = HideCommand;
