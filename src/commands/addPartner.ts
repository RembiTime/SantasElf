import { Command } from "discord-akairo";
import { Util, Message, Guild, TextChannel } from "discord.js";
import channels from "../channels.json";

class AddPartnerCommand extends Command {
	constructor() {
		super("addPartner", {
			aliases: ["addPartner"],
			description: "Adds a partner",
			channel: "guild",
			ownerOnly: true
		});
	}

	async exec(message: Message & { guild: Guild }) {
		await this.client.knex.transaction(async trx => {
			const isPartner = await message.guild.isPartner(trx);

			if (isPartner) {
				await message.channel.send("This guild is already partnered!");
			} else {
				await message.guild.setPartner(true, trx);
				const publicLogs = await this.client.channels.cache.get(channels.publicLogs) as TextChannel;
				let { guild } = message;
				publicLogs.send("**" + guild.name + "** is now a partner!");
				await message.channel.send(`**${Util.escapeMarkdown(message.guild.name)}** is now a partner!`);
				this.client.database.addLog(`${message.guild.name} has been added as a partner`);
			}
		});
	}
}

export = AddPartnerCommand;
