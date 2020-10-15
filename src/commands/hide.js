const { Command, Argument } = require("discord-akairo");

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
					type: Argument.range("integer", 1, 3, true),
					prompt: { start: "Please enter a difficulty level between 1-3", retry: "The difficulty must be a number between 1 and 3" }
				},
				{
					id: "description",
					type: "string",
					prompt: { start: "Please enter the steps of how to find your code! Please be as descriptive as possible, so it's easier for staff to find it or you might be denied!", retry: "Please enter the steps of how to find your code! Please be as descriptive as possible, so it's easier for staff to find it or you might be denied!" }
				}
			]
		});
	}

	async exec(message, { code, level }) {
		const present = await this.client.database.getPresent({ code, guildID: message.guild.id });
		const globalStats = await this.client.database.getGlobalStats();
		let newGuild = false;
		if (present !== null) {
			message.channel.send("That code already exists!");
			return;
		}
		/*if ( !(level <= 3) || !(level >= 1) ) {
			message.channel.send("Please enter a difficult level of 1-3.");
			return;
		}*/
		/* Move to end
		const checkNewGuild = await this.client.database.checkNewGuild({ code, guildID: message.guild.id });

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
		await message.channel.send("Created a present with the code of `" + code + "` and a difficulty of `" + level + "`.");
		if (newGuild == true) {
			console.log("'" + message.guild.name + "' just created their first present! There are now " + globalStats.guildsWithPresents + " servers participating!");
		} else {
			//TODO: add amount of presents in a guild
			console.log("'" + message.guild.name + "' just created a present! There are now " + globalStats.guildsWithPresents + " servers participating!");
		}
	}
}

module.exports = HideCommand;
