const { Command, Argument } = require("discord-akairo");
const { MessageEmbed, SnowflakeUtil } = require("discord.js");

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

	async exec(message, { code, level, description }) {
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
		const checkNewGuild = await this.client.database.checkNewGuild({ code, guildID: message.guild.id });

		if (checkNewGuild === null) {
			newGuild = true;
		}
		/* Move to end
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
		const staffQueue = this.client.channels.cache.get("766143817497313331");
		let invite = await message.channel.createInvite(
			{
				maxAge: 0,
				unique: true
			});
		const queueEmbed = new MessageEmbed()
			.setColor("#FE7E01")
			.setTitle("New present hidden!")
			.setThumbnail("https://images-ext-2.discordapp.net/external/ruZlz9t0ScVKeriIpD8l8mSsZ7ACks9CR7qz7aksJ4M/https/pbs.twimg.com/media/Dq3swg5W4AAnAXV.jpg%3Alarge?width=671&height=671")
			.addField("Present Info:", "Present Code: " + code + "\nDifficulty: " + level)
			.addField("Guild Info:", "Guild Name: " + message.guild.name + "\nPrevious Submits: 0 (TODO)\nMembers: " + message.guild.memberCount + "\nCreated on: " + message.guild.createdAt)
			.addField("Submitter Info:", "Submitted by: " + message.member.user.tag + "\nID: " + message.author.id)
			.addField("How to find:", description)
			.addField("Invite:", invite);
		let sent = await staffQueue.send("Pingrole", queueEmbed);
		await this.client.database.addStaffApprovalID({
			messageID: sent.id
		});
		const approvalMessage = await staffQueue.messages.fetch(sent.id);
		approvalMessage.react("❗");
		approvalMessage.react("✅");
		approvalMessage.react("❌");
	}
}

module.exports = HideCommand;
