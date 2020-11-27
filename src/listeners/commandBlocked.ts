import { Listener } from "discord-akairo";

class MissingPermsListener extends Listener {
	constructor() {
		super("missingPermissions", {
			emitter: "commandHandler",
			event: "missingPermissions"
		});
	}

	async exec(message, command, type) {
		if (type === "client") {
			await message.channel.send("I don't have the permissions I need to do that!");
		} else {
			await message.channel.send("You don't have permissions to do that in this guils!");
		}

	}
}

module.exports = MissingPermsListener;