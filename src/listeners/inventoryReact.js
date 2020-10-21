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

		const checkInventoryWatch = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
		if (checkInventoryWatch === null) {
			return;
		}

		if (checkInventoryWatch.userID !== user.id) {
			return;
		}

		const inventoryChannel = this.client.channels.cache.get(reaction.message.channel.id);
		const embedMessage = await inventoryChannel.messages.fetch(reaction.message.id);

		if (reaction.emoji.name === "⬅️") {
			if (checkInventoryWatch.pageNum === 1) {
				reaction.users.remove(user);
				if (checkInventoryWatch.invOrStats === "INV") {
					this.client.database.setInvPageNum({ pageNum: 8, messageID: reaction.message.id });
					const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
					this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
					return;
				} if (checkInventoryWatch.invOrStats === "STATS") {
					this.client.database.setInvPageNum({ pageNum: 2, messageID: reaction.message.id });
					const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
					this.client.database.updateStatsEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
					return;
				}
			} else {
				this.client.database.subInvPageNum({ messageID: reaction.message.id });
				reaction.users.remove(user);
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				if (checkInventoryWatch.invOrStats === "INV") {
					this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
					return;
				} if (checkInventoryWatch.invOrStats === "STATS") {
					this.client.database.updateStatsEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
					return;
				}
			}
		}
		if (reaction.emoji.name === "➡️") {
			if (checkInventoryWatch.pageNum === 8 && checkInventoryWatch.invOrStats === "INV") {
				reaction.users.remove(user);
				this.client.database.setInvPageNum({ pageNum: 1, messageID: reaction.message.id });
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
				return;
			} else if (checkInventoryWatch.pageNum === 2 && checkInventoryWatch.invOrStats === "STATS") {
				reaction.users.remove(user);
				this.client.database.setInvPageNum({ pageNum: 1, messageID: reaction.message.id });
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				this.client.database.updateStatsEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
				return;
			} else {
				this.client.database.addInvPageNum({ messageID: reaction.message.id });
				reaction.users.remove(user);
				const getPageNum = await this.client.database.checkInventoryWatch({ messageID: reaction.message.id });
				if (checkInventoryWatch.invOrStats === "INV") {
					this.client.database.updateInventoryEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
					return;
				} if (checkInventoryWatch.invOrStats === "STATS") {
					this.client.database.updateStatsEmbed({embedMessage: embedMessage, newPageNum: getPageNum.pageNum, oldEmbed: embedMessage.embeds[0], userID: reaction.message.author.id});
					return;
				}
			}
		}
		if (reaction.emoji.name === "⏹️") {
			embedMessage.delete();
			this.client.database.deleteInvWatcher({ messageID: reaction.message.id });
		}
	}
}

module.exports = InventoryReactListener;
