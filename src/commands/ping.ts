import { Command } from "discord-akairo";
import { Message } from "discord.js";

class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
			description: "Pong!"
		});
	}

	async exec(message: Message) {
		await message.channel.send("Pong!");
	}
}

export = PingCommand;
