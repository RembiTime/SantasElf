import { Command } from "discord-akairo";
import { Guild, Message } from "discord.js";

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

	async exec(message: Message, { guild }: { guild: Guild } ) {
		await this.client.knex.transaction(async trx => {
			if (await guild.appealStatus(trx) !== null) {
				await message.channel.send("This guild has been given 2 more attempts");
			} else {
				await guild.setAppealStatus("ACCEPTED", trx);
				await message.channel.send("This guild has been given 2 more attempts");
			}
		});
	}
}

export = AppealAcceptCommand;
