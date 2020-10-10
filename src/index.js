require("dotenv").config();

const { AkairoClient, CommandHandler, ListenerHandler } = require("discord-akairo");
const path = require("path");

class SantasElf extends AkairoClient {
	constructor() {
		super({
			ownerID: process.env.OWNER_IDS.split(",")
		});

		this.commandHandler = new CommandHandler(this, {
			directory: path.join(__dirname, "commands"),
			prefix: ","
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: path.join(__dirname, "listeners"),
		});

		this.commandHandler.loadAll();
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.loadAll();
	}
}

const client = new SantasElf();
client.login(process.env.token);
