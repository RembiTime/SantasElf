import { Command } from "discord-akairo";

class AppealAcceptCommand extends Command {
	constructor() {
		super("appealAccept", {
			aliases: ["appealAccept", "aa"],
			description: "Accept a 3 denied appeal",
			ownerOnly: true,
			args: [{
				id: "guild",
				type: "guild"
			}]
		});
	}

	async exec(message, { guild }) {
		// TODO: ensure guild has actually appealed?

		if (!guild) {
			await message.channel.send("The bot is not in that guild!");
			return;
		}

		const guildData = await guild.fetchData();

		if (guildData.appealed3Deny) {
			await message.channel.send("This server has already appealed.");
			return;
		}

		await this.client.knex("guildData")
			.update({ appealed3Deny: true })
			.where({ guildID: guild.id });

		await message.channel.send("This guild has been given 2 more attempts");
	}
}

export = AppealAcceptCommand;
