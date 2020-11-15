const { Listener } = require("../Listener");
const { MessageEmbed, TextChannel } = require("discord.js");

class StaffApprovalListener extends Listener {
	constructor() {
		super("staff-approval", {
			emitter: "client",
			event: "messageReactionAdd"
		});
	}

	async exec(reaction, user) {
		if (reaction.message.partial) { await reaction.message.fetch(); }
		if (user.partial) { await user.fetch(); }

		if (reaction.message.channel.id !== "766143817497313331") {
			return;
		}

		if (user.id === this.client.user.id) {
			return;
		}

		//const checkMessageID = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });
		const checkApprovalIfOngoing = await this.client.database.checkApprovalIfOngoing({ messageID: reaction.message.id });

		if (checkApprovalIfOngoing === null) {
			return;
		}
		const staffQueue = this.client.channels.cache.get("766143817497313331");
		if (!(staffQueue instanceof TextChannel)) throw new Error("Staff queue channel was not a text channel.");
		const approvalMessage = await staffQueue.messages.fetch(reaction.message.id);

		if (reaction.emoji.name === "❗") {
			const findIfClaimedBy = await this.client.database.findIfClaimedBy({ messageID: reaction.message.id });
			if (findIfClaimedBy.claimedByID !== null) {
				reaction.users.remove(user);
				return;
			}
			this.client.database.claimedUpdate({ userID: user.id, messageID: reaction.message.id });
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#F7F55D")
				.setFooter("Claimed by " + user.username + "#" + user.discriminator);
			approvalMessage.edit(editedEmbed);
		}
		if (reaction.emoji.name === "✅") {
			const checkStaffApproval = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });
			const hiddenBy = await this.client.users.fetch(checkStaffApproval.hiddenByID);
			// TODO: handle bot not in guild
			hiddenBy.send("Your present with the code **" + checkStaffApproval.code + "** in the server **" + this.client.guilds.cache.get(checkStaffApproval.guildID).name + "** was accepted! Your server has been posted and your present has been added for people to find!");
			await this.client.database.addPresent({
				code: checkStaffApproval.code,
				presentLevel: checkStaffApproval.presentLevel,
				timesFound: 0,
				guildID: checkStaffApproval.guildID,
				channelID: checkStaffApproval.channelID,
				hiddenByID: checkStaffApproval.hiddenByID,
				usesLeft: null
			});
			this.client.database.approvalStatusUpdate({ status: "ACCEPTED", messageID: reaction.message.id });
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#8DFF5A")
				.setFooter("Approved by " + user.username + "#" + user.discriminator);
			approvalMessage.edit(editedEmbed);
			const publicLogs = await this.client.channels.cache.get("777276173508018216");
			if (!(publicLogs instanceof TextChannel)) throw new Error("Public logs channel was not a text channel.");
			const guildName = await this.client.guilds.cache.get(checkStaffApproval.guildID);
			publicLogs.send("A level " + checkStaffApproval.presentLevel + " present has been hidden in **" + guildName.name + "**!");
		}
		if (reaction.emoji.name === "❌") {
			const checkStaffApproval = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });
			const deniedCount = await this.client.database.checkGuildDeniedAmount({ guildID: checkStaffApproval.guildID });
			const hiddenBy = await this.client.users.fetch(checkStaffApproval.hiddenByID);
			this.client.database.approvalStatusUpdate({ status: "DENIED", messageID: reaction.message.id });
			hiddenBy.send("Your present with the code **" + checkStaffApproval.code + "** in the server **" + this.client.guilds.cache.get(checkStaffApproval.guildID).name + "** was denied. You have been denied **" + deniedCount + "** times now. This could be because you provided an insufficient description or because your code just wasn't there. You can submit 3 times before your server is banned from submitting anymore, so please be more careful next time that you submit.");
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#FF5A5A")
				.setFooter("Denied by " + user.username + "#" + user.discriminator);
			approvalMessage.edit(editedEmbed);
		}
	}
}

module.exports = StaffApprovalListener;
