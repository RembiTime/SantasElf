const { Listener } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

class StaffApprovalRemoveListener extends Listener {
	constructor() {
		super("staff-approval-remove", {
			emitter: "client",
			event: "messageReactionRemove"
		});
	}

	async exec(reaction, user) {
		if (reaction.message.channel.id !== "766143817497313331") {
			return;
		}
		const checkMessageID = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });

		if (checkMessageID === null) {
			return;
		}

		const staffQueue = this.client.channels.cache.get("766143817497313331");
		const approvalMessage = await staffQueue.messages.fetch(reaction.message.id);

		if (reaction._emoji.name === "❗") {
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#FE7E01");
			editedEmbed.footer = null
			approvalMessage.edit(editedEmbed);
		}
	}
}

module.exports = StaffApprovalRemoveListener;
