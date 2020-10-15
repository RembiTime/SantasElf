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

		const checkMessageID = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });

		if (checkMessageID === null) {
			return;
		}
		const staffQueue = this.client.channels.cache.get("766143817497313331");
		const approvalMessage = await staffQueue.messages.fetch(reaction.message.id);

		if (reaction._emoji.name === "❗") {
			const oldEmbed = approvalMessage.embeds[0];
			const editedEmbed = new MessageEmbed(oldEmbed)
				.setColor("#F7F55D")
				.setFooter("Claimed by " + user.username + "#" + user.discriminator);
			approvalMessage.edit(editedEmbed);
		}
	}
}

module.exports = StaffApprovalListener;
