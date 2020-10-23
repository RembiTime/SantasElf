const { Argument, Command } = require("discord-akairo");

class ChangeLevelCommand extends Command {
	constructor() {
		super("changeLevel", {
			aliases: ["changeLevel", "cl"],
			description: "Mod-only command for changing the level of a present",
			args: [
				{
					id: "level",
					type: Argument.range("integer", 1, 5, true)
				},
				{
					id: "messageID",
					type: "string"
				}
			]
		});
	}

	async exec(message, { level, messageID }) {
		if (message.channel.id !== "766143817497313331") {
			return;
		}
		const checkStaffApproval = await this.client.database.checkStaffApprovalIDs({messageID});
		if (checkStaffApproval === null) {
			message.channel.send("This message ID does not exist");
			return;
		}
		this.client.database.changeLevel({presentLevel: level, messageID: messageID});
		const approvalMessage = await message.channel.messages.fetch(messageID);
		const oldEmbed = approvalMessage.embeds[0];
		for (const field of oldEmbed.fields) {
			if (field.name === "Present Info:") field.value = "Present Code: " + checkStaffApproval.code + "\nDifficulty: " + level;
		}
		approvalMessage.edit(oldEmbed);
		message.delete();
	}
}

module.exports = ChangeLevelCommand;
