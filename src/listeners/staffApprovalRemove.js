const { Listener } = require("../Listener");
const { MessageEmbed, TextChannel } = require("discord.js");

class StaffApprovalRemoveListener extends Listener {
	constructor() {
		super("staff-approval-remove", {
			emitter: "client",
			event: "messageReactionRemove"
		});
	}

	async exec(reaction, user) {
		if (reaction.message.partial) { await reaction.message.fetch(); }

		if (reaction.message.channel.id !== "766143817497313331") {
			return;
		}
		const checkApprovalIfOngoing = await this.client.database.checkApprovalIfOngoing({ messageID: reaction.message.id });

		if (checkApprovalIfOngoing === null) {
			return;
		}

		const staffQueue = this.client.channels.cache.get("766143817497313331");
		if (!(staffQueue instanceof TextChannel)) throw new Error("Staff queue channel was not a text channel.");
		const approvalMessage = await staffQueue.messages.fetch(reaction.message.id);

		if (reaction.emoji.name === "❗") {
			const findIfClaimedBy = await this.client.database.findIfClaimedBy({ messageID: reaction.message.id });
			if (findIfClaimedBy.claimedByID !== user.id) {
				return;
			}
			this.client.database.notClaimed({ messageID: reaction.message.id });
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#FE7E01");
			editedEmbed.footer = null;
			approvalMessage.edit(editedEmbed);
		}
	}
}

module.exports = StaffApprovalRemoveListener;
