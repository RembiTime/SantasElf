import { Command } from "discord-akairo";

class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
			description: "Pong!"
		});
	}

	async exec(message) {
		await message.channel.send("Pong!");
	}
}

export = PingCommand;
