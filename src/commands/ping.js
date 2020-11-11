const { Command } = require("discord-akairo");

class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
			description: "Pong!"
		});
	}

	async exec(message) {
		await message.channel.send("Pong!");
		this.client.database.foundAchievement({achName: "presentTotal", userID: message.author.id, message: message});
	}
}

module.exports = PingCommand;
