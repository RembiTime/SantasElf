import { Listener } from "discord-akairo";

class BlockedCmdListener extends Listener {
	constructor() {
		super("commandBlocked", {
			emitter: "commandHandler",
			event: "commandBlocked"
		});
	}

	async exec(message, command, reason) {
		if (reason === "owner") {
			await message.channel.send("Only bot devs can do that...");
		} else if (reason === "dm") {
			await message.channel.send("You have to do that in DMs!");
		} else if (reason === "guild") {
			await message.channel.send("You can't do that in DMs!");
		}
	}
}

module.exports = BlockedCmdListener;
