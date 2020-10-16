const { Listener } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

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
		const approvalMessage = await staffQueue.messages.fetch(reaction.message.id);

		if (reaction._emoji.name === "❗") {
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
		if (reaction._emoji.name === "✅") {
			const checkStaffApproval = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });
			const hiddenBy = await this.client.users.fetch(checkStaffApproval.hiddenByID);
			hiddenBy.send("Your present with the code **" + checkStaffApproval.code + "** in the server **" + checkStaffApproval.guildName + "** was accepted! Your server has been posted and your present has been added for people to find!");
			await this.client.database.addPresent({
				code: checkStaffApproval.code,
				presentLevel: checkStaffApproval.presentLevel,
				timesFound: 0,
				guildName: checkStaffApproval.guildName,
				guildID: checkStaffApproval.guildID,
				channelName: checkStaffApproval.channelName,
				channelID: checkStaffApproval.channelID,
				hiddenByName: checkStaffApproval.hiddenByName,
				hiddenByID: checkStaffApproval.hiddenByID
			});
			this.client.database.approvalStatusUpdate({ status: "ACCEPTED", messageID: reaction.message.id });
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#8DFF5A")
				.setFooter("Approved by " + user.username + "#" + user.discriminator);
			approvalMessage.edit(editedEmbed);
		}
		if (reaction._emoji.name === "❌") {
			const checkStaffApproval = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });
			const hiddenBy = await this.client.users.fetch(checkStaffApproval.hiddenByID);
			hiddenBy.send("Your present with the code **" + checkStaffApproval.code + "** in the server **" + checkStaffApproval.guildName + "** was denied. This could be because you provided an insufficient description or because your code just wasn't there. You can submit 3 times before your server is banned from submitting anymore, so please be more careful next time that you submit.");
			this.client.database.approvalStatusUpdate({ status: "DENIED", messageID: reaction.message.id });
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#FF5A5A")
				.setFooter("Denied by " + user.username + "#" + user.discriminator);
			approvalMessage.edit(editedEmbed);
		}
	}
}

module.exports = StaffApprovalListener;
