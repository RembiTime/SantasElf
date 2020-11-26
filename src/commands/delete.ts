import { Command } from "discord-akairo";

class DeleteCommand extends Command {
	constructor() {
		super("delete", {
			aliases: ["del", "delete"],
			description: "(,delete code) Delete a code",
			args: [{
				id: "code",
				type: "string"
			}],
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"]
		});
	}

	async exec(message, { code }) {
		await this.client.knex.transaction(async trx => {
			const present = await trx("presents")
				.first("*")
				.where({ code, guildID: message.guild.id })
				.forUpdate();

			if (present) {
				await trx("presents")
					.where({ code })
					.delete();

				this.client.database.addLog(`${message.author.tag} deleted the present ${code} from ${message.guild.name}`);

				await message.channel.send("Present deleted");
				if (present.guildID) await this.client.updateDisplayForGuild(present.guildID);
			} else await message.channel.send("This present does not exist!");
		});
	}
}

export = DeleteCommand;
