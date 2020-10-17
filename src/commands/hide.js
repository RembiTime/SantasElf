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
		let newGuild = false;
		if (present !== null) {
			message.channel.send("That code already exists!");
			return;
		}
		const guildDeniedAmount = await this.client.database.checkGuildDeniedAmount({ guildID: message.guild.id });
		if (guildDeniedAmount.count > 3) {
			message.channel.send("Your server has been denied 3 times already. You have been blacklisted from submitting again. If you would like to appeal this, please do so with a support ticket on the main server.")
			return;
		}
		const checkPending = await this.client.database.checkIfPendingPresent({ guildID: message.guild.id });
		if (checkPending.count !== 0) {
			message.channel.send("Your server has already submitted a present! Please wait for a decision on your previous present to submit a new one.")
			return;
		}
		await message.channel.send("Your present with the code of `" + code + "` and a difficulty of `" + level + "` has been sent to the staff team to review!");
		const staffQueue = this.client.channels.cache.get("766143817497313331");
		let invite = await message.channel.createInvite(
			{
				maxAge: 0,
				unique: true
			});
		let guildAge = Math.floor((Date.now() - message.guild.createdAt.getTime()) / 86400000);
		const queueEmbed = new MessageEmbed()
			.setColor("#FE7E01")
			.setTitle("New present hidden!")
			.setThumbnail("https://images-ext-2.discordapp.net/external/ruZlz9t0ScVKeriIpD8l8mSsZ7ACks9CR7qz7aksJ4M/https/pbs.twimg.com/media/Dq3swg5W4AAnAXV.jpg%3Alarge?width=671&height=671")
			.addField("Present Info:", "Present Code: " + code + "\nDifficulty: " + level)
			.addField("Guild Info:", "Guild Name: " + message.guild.name + "\nPrevious Submits: 0 (TODO)\nMembers: " + message.guild.memberCount + "\nDays Created: " + guildAge)
			.addField("Submitter Info:", "Submitted by: " + message.member.user.tag + "\nID: " + message.author.id)
			.addField("How to find:", description)
			.addField("Invite:", invite);
		let sent = await staffQueue.send("Pingrole", queueEmbed);
		await this.client.database.addStaffApprovalID({
			messageID: sent.id,
			status: "ONGOING",
			code: code,
			presentLevel: level,
			guildID: message.guild.id,
			channelID: message.channel.id,
			hiddenByID: message.author.id
		});
		const approvalMessage = await staffQueue.messages.fetch(sent.id);
		approvalMessage.react("❗");
		approvalMessage.react("✅");
		approvalMessage.react("❌");
	}
}

module.exports = HideCommand;
