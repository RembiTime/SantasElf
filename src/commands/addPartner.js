const { Command } = require("discord-akairo");
const { Util: { escapeMarkdown } } = require("discord.js");

class AddPartnerCommand extends Command {
	constructor() {
		super("addPartner", {
			aliases: ["addPartner"],
			description: "Adds a partner",
			ownerOnly: true
		});
	}

	async exec(message) {
		// This could double-send the success message if run twice in quick succession,
		// but the race condition is harmless

		await message.guild.ensureDB();

		const [{ isPartner }] = await this.client.knex("guildData")
			.select("isPartner")
			.where({ guildID: message.guild.id });

		if (isPartner) {
			message.channel.send("This guild is already partnered!");
			return;
		} else {
			await this.client.knex("guildData")
				.update({ isPartner: true })
				.where({ guildID: message.guild.id });

			await message.channel.send(`**${escapeMarkdown(message.guild.name)}** is now a partner!`);
		}
	}
}

module.exports = AddPartnerCommand;
