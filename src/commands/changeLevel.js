const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

class ChangeLevelCommand extends Command {
	constructor() {
		super("changeLevel", {
			aliases: ["changeLevel", "cl"],
			description: "Mod-only command for changing the level of a present",
			args: [
				{
					id: "level",
					type: "int"
				},
				{
					id: "messageID",
					type: "string"
				}
			]
		});
	}

	async exec(message, { level, messageID }) {
		console.log("hi")
		const checkStaffApproval = await this.client.databse.checkStaffApprovalIDs({messageID});
		if (checkStaffApproval === null) {
			message.channel.send("This message ID does not exist");
			return;
		}
		this.client.database.changeLevel({level, messageID});
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
