import { Command } from "discord-akairo";

class DeleteCommand extends Command {
	constructor() {
		super("delete", {
			aliases: ["del", "delete"],
			description: "Delete a code",
			args: [{
				id: "code",
				type: "string"
			}]
		});
	}
	async exec(message, { code }) {
		if (!message.member.hasPermission("ADMINISTRATOR")) {
			await message.channel.send("You must have administrator permissions in this server to use this command!");
			return;
		}
		const [results] = await this.client.knex.select("*").from("presents").where({code});
		const checkValid = results ?? null;
		if (checkValid === null) {
			message.channel.send("This present does not exist!");
			return;
		}
		await this.client.knex("presents").where({code}).del();
		message.channel.send("Present deleted");

	}
}

export = DeleteCommand;
