require("dotenv").config();

const { AkairoClient, CommandHandler, ListenerHandler } = require("discord-akairo");
const path = require("path");
const Database = require("./Database");

class SantasElf extends AkairoClient {
	constructor() {
		super(
			{
				ownerID: process.env.OWNER_IDS.split(",")
			}, {
				partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION" ]
			}
		);

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

		this.database = new Database(this, {
			host: process.env.MYSQL_HOST,
			port: parseInt(process.env.MYSQL_PORT),
			user: process.env.MYSQL_USERNAME,
			password: process.env.MYSQL_PASSWORD,
			database: process.env.MYSQL_DATABASE
		});
	}

	async login(token) {
		await this.database.init();
		return super.login(token);
	}
}

const client = new SantasElf();
client.login(process.env.TOKEN);
