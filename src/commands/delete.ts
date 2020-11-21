import { Command } from "discord-akairo";

class DeleteCommand extends Command {
	constructor() {
		super("delete", {
			aliases: ["del", "delete"],
			description: "Delete a code",
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
				.where({ code })
				.forUpdate();

			if (!present) {
				await trx("presents")
					.where({ code })
					.delete();

				await message.channel.send("Present deleted");
			} else {
				await message.channel.send("This present does not exist!");

			}
		});
	}
}

export = DeleteCommand;