const { Listener } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

class MinigameListener extends Listener {
	constructor() {
		super("minigame-reactions", {
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
		const checkIfMinigame = await this.client.database.checkMinigame({ messageID: reaction.message.id });

		if (checkIfMinigame === null) {
			return;
		}

		if (checkIfMinigame.userID !== user.id) {
			return;
		}

		const minigameChannel = this.client.channels.cache.get(reaction.message.channel.id);
		const gameMessage = await minigameChannel.messages.fetch(reaction.message.id);

		if (checkIfMinigame.minigame === "PALETTE") {
			const minigameMessage = await minigameChannel.messages.fetch(checkIfMinigame.palletteMessage);
			const lookupMap = {
				"1️⃣": 0,
				"2️⃣": 1,
				"3️⃣": 2,
				"4️⃣": 3,
				"5️⃣": 4,
				"6️⃣": 5,
				"7️⃣": 6,
				"8️⃣": 7,
				"9️⃣": 8,
			};
			const reactionAnswer = lookupMap[reaction.emoji.name];
			if (reactionAnswer !== checkIfMinigame.paletteAnswer) {
				this.client.database.deleteMinigameListener({messageID: reaction.message.id});
				this.client.database.removeItem({itemName: "palette", userID: user.id});
				let answer = checkIfMinigame.paletteAnswer + 1;
				minigameMessage.edit("That's incorrect, it was "+ answer + ". Try again next time!");
				return;
			} else {
				this.client.database.addCandyCanes({amount: 30, userID: user.id});
				this.client.database.deleteMinigameListener({messageID: reaction.message.id});
				this.client.database.removeItem({itemName: "palette", userID: user.id});
				minigameMessage.edit("That's correct! You got 30 candy canes!");
				return;
			}
		}
	}
}

module.exports = MinigameListener;
