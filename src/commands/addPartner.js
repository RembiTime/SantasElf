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

		const isPartner = await this.client.knex("guildData").count("guildID", { as: "count" })
			.where({ guildID: message.guild.id, isPartner: true })
			.then(([{ count }]) => count !== 0);

		if (isPartner) {
			message.channel.send("This guild is already partnered!");
			return;
		} else {
			await this.client.knex("guildData")
				.insert({ guildID: message.guild.id, isPartner: true })
				.onConflict().merge({ isPartner: true });

			message.channel.send(`**${escapeMarkdown(message.guild.name)}** is now a partner!`);
		}
	}
}

module.exports = AddPartnerCommand;
