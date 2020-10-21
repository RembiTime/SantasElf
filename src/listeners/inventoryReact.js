const { Listener } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

class InventoryReactListener extends Listener {
	constructor() {
		super("inventory-react", {
			emitter: "client",
			event: "messageReactionAdd"
		});
	}

	async exec(reaction, user) {
		if (reaction.message.partial) { await reaction.message.fetch(); }
		if (user.partial) { await user.fetch(); }

		if (user.id === this.client.user.id) {
			return;
		}

		//const checkMessageID = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });
		const checkInventoryWatch = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });

		if (checkInventoryWatch === null) {
			return;
		}
		const inventoryChannel = this.client.channels.cache.get(reaction.message.channel.id);
		const embedMessage = await inventoryChannel.messages.fetch(reaction.message.id);

		if (reaction.emoji.name === "⬅️") {
			if (checkInventoryWatch.pageNum === 1) {
				this.client.database.setInvPageNum({ pageNum: 3, messageID: reaction.message.id });
				reaction.users.remove(user);
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
				return;
			} else {
				this.client.database.subInvPageNum({ messageID: reaction.message.id });
				reaction.users.remove(user);
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
				return;
			}
		}
		if (reaction.emoji.name === "➡️") {
			if (checkInventoryWatch.pageNum === 3) {
				this.client.database.setInvPageNum({ pageNum: 1, messageID: reaction.message.id });
				reaction.users.remove(user);
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
				return;
			} else {
				this.client.database.addInvPageNum({ messageID: reaction.message.id });
				reaction.users.remove(user);
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
				return;
			}
		}
		if (reaction.emoji.name === "⏹️") {
			embedMessage.delete();
			this.client.database.deleteInvWatcher({ messageID: reaction.message.id });
		}
	}
}

module.exports = InventoryReactListener;
