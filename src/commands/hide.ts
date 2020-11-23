import { Argument, Command } from "discord-akairo";
import { MessageEmbed, TextChannel, DMChannel } from "discord.js";
import channels from "../channels.json";

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
					type: Argument.range("integer", 1, 5, true),
					prompt: { start: "Please enter a difficulty level between 1-3 (1-5 if you're a partner)", retry: "The difficulty must be a number between 1 and 3 (1 and 5 if you're a partner)" }
				},
				{
					id: "description",
					type: "string",
					prompt: { start: "Please enter the steps of how to find your code! Please be as descriptive as possible, so it's easier for staff to find it or you might be denied!", retry: "Please enter the steps of how to find your code! Please be as descriptive as possible, so it's easier for staff to find it or you might be denied!" }
				}
			],
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"]
		});
	}

	async exec(message, { code, level, description }) {
		
		if (message.guild.memberCount < 25 && message.guild.id !== "761076559813279754") {
			await message.channel.send("Your server must have at least 25 members to submit a present");
			return;
		}
		if (code === null) {
			await message.channel.send("Please enter a code!");
			return;
		}
		if (code.length >= 1024) {
			await message.channel.send("That code it too long!");
			return;
		}
		if (code.startsWith(",")) {
			await message.channel.send("Please don't hide codes that start with ,!");
			return;
		}
		const present = await this.client.database.getPresent({ code });
		const queuePresent = await this.client.database.checkOngoingIfCodeDupe({ code });
		const checkNewGuild = await this.client.database.checkNewGuild({ guildID: message.guild.id });
		const isPartner = await this.client.database.isPartner(message.guild.id);
		if (checkNewGuild === null) {
			await this.client.database.addNewGuild({guildID: message.guild.id});
		}
		if (present !== null || queuePresent !== null) {
			await message.channel.send("That code already exists!");
			return;
		}
		if (!isPartner) {
			const presentAmount = await this.client.database.checkPresentAmount({ guildID: message.guild.id });
			if (level > 3) {
				await message.channel.send("Your server can only have a present up to level 3. If you would like to go up to level 5, please apply to be a partner.");
				return;
			}
			if (presentAmount > 3) {
				await message.channel.send("Your server has reached the maximum amount of presents in your server. If you would like more, please apply to be a partner.");
				return;
			}
		}
		const guildDeniedAmount = await this.client.database.checkGuildDeniedAmount({ guildID: message.guild.id });
		if (guildDeniedAmount >= 3) {
			if (!checkNewGuild?.appealed3Deny) {
				await message.channel.send("Your server has been denied 3 times already. You have been blacklisted from submitting again. If you would like to appeal this, please do so with a support ticket on the main server.");
				return;
			} else if (guildDeniedAmount >= 5) {
				await message.channel.send("Your server has been denied 5 times already. Because you have already appealed, you can no longer submit any presents");
				return;
			}
		}
		const checkPending = await this.client.database.checkIfPendingPresent({ guildID: message.guild.id });
		if (+checkPending !== 0) {
			await message.channel.send("Your server has already submitted a present! Please wait for a decision on your previous present to submit a new one.");
			return;
		}
		await message.channel.send("Your present with the code of `" + code + "` and a difficulty of `" + level + "` has been sent to the staff team to review!");
		const staffQueue = this.client.channels.cache.get(channels.staffQueue);
		if (!(staffQueue instanceof TextChannel)) throw new Error("Staff queue channel was not a text channel!");
		if (message.channel instanceof DMChannel) return message.channel.send("You cannot do this in a DM.");
		const invite = await message.channel.createInvite(
			{
				maxAge: 0,
				unique: true
			});
		const guildAge = Math.floor((Date.now() - message.guild.createdAt.getTime()) / 86400000);
		const queueEmbed = new MessageEmbed()
			.setColor("#FE7E01")
			.setTitle("New present hidden!")
			.setThumbnail("https://images-ext-2.discordapp.net/external/ruZlz9t0ScVKeriIpD8l8mSsZ7ACks9CR7qz7aksJ4M/https/pbs.twimg.com/media/Dq3swg5W4AAnAXV.jpg%3Alarge?width=671&height=671")
			.addField("Present Info:", "Present Code: " + code + "\nDifficulty: " + level)
			.addField("Guild Info:", "Guild Name: " + message.guild.name + "\nPrevious Submits: " + guildDeniedAmount + "\nMembers: " + message.guild.memberCount + "\nDays Created: " + guildAge + "\n Are they a partner? " + isPartner)
			.addField("Submitter Info:", "Submitted by: " + message.member.user.tag + "\nID: " + message.author.id)
			.addField("How to find:", description)
			.addField("Invite:", invite);
		const sent = await staffQueue.send("Pingrole", queueEmbed);
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
		await approvalMessage.react("❗");
		await approvalMessage.react("✅");
		await approvalMessage.react("❌");
	}
}

export = HideCommand;
