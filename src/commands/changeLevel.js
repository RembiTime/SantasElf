const { Argument } = require("discord-akairo");
const { Command } = require("discord-akairo");
class ChangeLevelCommand extends Command {
	constructor() {
		super("changeLevel", {
			aliases: ["changeLevel", "cl"],
			description: "Mod-only command for changing the level of a present",
			args: [
				{
					id: "presentLevel",
					type: Argument.range("integer", 1, 5, true)
				},
				{
					id: "messageID",
					type: "string"
				}
			]
		});
	}

	/**
	 * @param {import("discord.js").Message} message
	 * @param {{ presentLevel: number, messageID: string }} args
	 */
	async exec(message, { presentLevel, messageID }) {
		// TODO: not hardcode this (and review this command  in general)
		if (message.channel.id !== "766143817497313331") {
			return;
		}

		const staffApproval = await this.client.knex("staffApproval")
			.select("*")
			.where("messageID", "=", messageID)
			.then(results => results.length ? results[0] : null);

		if (staffApproval === null) {
			await message.channel.send("There is no present approval message with that ID");
			return;
		}

		await this.client.knex("staffApproval")
			.update({ presentLevel })
			.where("messageID", "=", messageID);

		const approvalMessage = await message.channel.messages.fetch(messageID);

		const oldEmbed = approvalMessage.embeds[0];
		for (const field of oldEmbed.fields) {
			if (field.name === "Present Info:") {
				field.value = `Present Code: ${staffApproval.code}\nDifficulty: ${presentLevel}`;
			}
		}

		await approvalMessage.edit(oldEmbed);

		await message.delete();
	}
}

module.exports = ChangeLevelCommand;
