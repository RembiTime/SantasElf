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
		const present = await this.client.database.getPresent({ code, guildID: message.guild.id });
		const checkNewGuild = await this.client.database.checkNewGuild({ code, guildID: message.guild.id });
		const globalStats = await this.client.database.getGlobalStats();
		let newGuild = false;
		if (present !== null) {
			message.channel.send("That code already exists!");
			return;
		}
		if ( !(level <= 3) || !(level >= 1) ) {
			message.channel.send("Please enter a difficult level of 1-3.");
			return;
		}
		/* Move to end
		if (checkNewGuild === null) {
			newGuild = true;
		}
		await this.client.database.addPresent({
			code,
			presentLevel: level,
			timesFound: 0,
			guildName: message.guild.name,
			guildID: message.guild.id,
			channelName: message.channel.name,
			channelID: message.channel.id,
			hiddenByName: message.member.user.tag,
			hiddenByID: message.author.id
		});*/
		const filter = (reaction, user) => {
			return reaction.emoji.name === '👍' && user.id === message.author.id;
 		};
		await message.channel.send("Created a present with the code of `" + code + "` and a difficulty of `" + level + "`.").then(() => {
			message.channel.awaitMessages()
		})
		if (newGuild == true) {
			console.log("'" + message.guild.name + "' just created their first present! There are now " + globalStats.guildsWithPresents + " servers participating!");
		} else {
			//TODO: add amount of presents in a guild
			console.log("'" + message.guild.name + "' just created a present! There are now " + globalStats.guildsWithPresents + " servers participating!");
		}
	}
}

module.exports = HideCommand;
