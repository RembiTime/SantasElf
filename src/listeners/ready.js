const { Listener } = require("../Listener");

class ReadyListener extends Listener {
	constructor() {
		super("ready", {
			emitter: "client",
			event: "ready"
		});
	}

	exec() {
		console.log(`Logged in as ${this.client.user.tag}!`);
	}
}

module.exports = ReadyListener;
