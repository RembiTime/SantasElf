const { Listener } = require("discord-akairo");

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
		  await message.channel.send("You don't have the permissions to do that!");
		}
		  
	}
}

module.exports = MissingPermsListener;
