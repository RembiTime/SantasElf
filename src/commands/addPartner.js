const { Command } = require("discord-akairo");

class AddPartnerCommand extends Command {
	constructor() {
		super("addPartner", {
			aliases: ["addPartner"],
			description: "Adds a partner",
			ownerOnly: true
		});
	}

	async exec(message) {
		const findIfGuildExists = await this.client.database.findIfGuildExists({ guildID: message.guild.id });
		if (findIfGuildExists === null) {
			await this.client.database.addNewGuild({
				guildID: message.guild.id,
				trueFalse: "TRUE"
			});
		} else {
			this.client.database.addPartner({ guildID: message.guild.id });
		}
		message.channel.send(message.guild.name + " now has partner permissions!");
	}
}

module.exports = AddPartnerCommand;
