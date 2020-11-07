require("dotenv").config();

const { AkairoClient, CommandHandler, ListenerHandler } = require("discord-akairo");

const path = require("path");
const knex = require("knex");

const items = require("./items");
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

		this.knex = knex({
			client: "mysql2",
			connection: {
				host: process.env.MYSQL_HOST,
				port: parseInt(process.env.MYSQL_PORT),
				user: process.env.MYSQL_USERNAME,
				password: process.env.MYSQL_PASSWORD,
				database: process.env.MYSQL_DATABASE
			}
		});

		this.minigamePlayers = new Set();
	}

	async login(token) {
		await this.initDatabase();
		return super.login(token);
	}

	async initDatabase() {
		// TODO: default values
		// TODO: extract to another file?

		if (!await this.knex.schema.hasTable("presents")) {
			await this.knex.schema.createTable("presents", table => {
				table.increments("id").primary();
				table.string("code").notNullable();
				table.integer("presentLevel").notNullable();
				table.integer("timesFound").notNullable();
				table.bigInteger("guildID").unsigned().notNullable();
				table.bigInteger("channelID").unsigned().notNullable();
				table.bigInteger("hiddenByID").unsigned().notNullable();
			});
		}

		if (!await this.knex.schema.hasTable("itemsConfig")) {
			await this.knex.schema.createTable("itemsConfig", table => {
				table.string("name").primary();
				table.integer("rank", 1).notNullable();
			});

			// knex doesn't support CHECK constraints :(
			await this.knex.raw("ALTER TABLE itemsConfig ADD CONSTRAINT CHECK (rank >= 0 AND rank <= 6)");
		}


		if (!await this.knex.schema.hasTable("items")) {
			await this.knex.schema.createTable("items", table => {
				table.string("name").notNullable();
				table.bigInteger("userID").unsigned().notNullable();
				table.integer("amount").notNullable();
				table.integer("record").notNullable();

				table.primary(["name", "userID"]);
				table.foreign("name").references("name").inTable("itemsConfig");
			});
		}

		if (!await this.knex.schema.hasTable("userData")) {
			await this.knex.schema.createTable("userData", table => {
				table.bigInteger("userID").unsigned().primary();
				// TODO: we shouldn't have this
				table.string("userName").notNullable();

				table.integer("candyCanes").notNullable();
				table.integer("wrongGuesses").notNullable();

				// TODO: these are all also bad
				table.integer("firstFinder").notNullable();
				table.integer("totalPresents").notNullable();
				table.integer("lvl1Presents").notNullable();
				table.integer("lvl1Total").notNullable();
				table.integer("lvl2Presents").notNullable();
				table.integer("lvl2Total").notNullable();
				table.integer("lvl3Presents").notNullable();
				table.integer("lvl3Total").notNullable();
				table.integer("lvl4Presents").notNullable();
				table.integer("lvl4Total").notNullable();
				table.integer("lvl5Presents").notNullable();
				table.integer("lvl5Total").notNullable();
			});

		}


		if (!await this.knex.schema.hasTable("foundPresents")) {
			await this.knex.schema.createTable("foundPresents", table => {
				table.increments("id").primary();
				table.bigInteger("userID").unsigned().notNullable();
				table.string("userName").notNullable();
				table.string("presentCode").notNullable();
			});
		}

		if (!await this.knex.schema.hasTable("staffApproval")) {
			await this.knex.schema.createTable("staffApproval", table => {
				// TODO: primary key
				table.bigInteger("messageID").unsigned();
				table.enum("status", ["ONGOING", "ACCEPTED", "DENIED"]).notNullable();
				table.bigInteger("claimedByID").unsigned().nullable();
				table.string("code").notNullable();
				table.integer("presentLevel").notNullable();
				table.bigInteger("guildID").unsigned().notNullable();
				table.bigInteger("channelID").unsigned().notNullable();
				table.bigInteger("hiddenByID").unsigned().notNullable();
			});
		}


		if (!await this.knex.schema.hasTable("guildData")) {
			await this.knex.schema.createTable("guildData", table => {
				table.bigInteger("guildID").unsigned().primary();
				table.boolean("isPartner").notNullable().defaultTo(false);
				table.boolean("appealed3Deny").notNullable().defaultTo(false);
			});
		}

		await Promise.all(items.map(item =>
			this.knex("itemsConfig").insert({ name: item.id, rank: item.rank }).onConflict().ignore()
		));
	}
}

const client = new SantasElf();
client.login(process.env.TOKEN);
