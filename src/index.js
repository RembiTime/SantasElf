require("dotenv").config();

const { AkairoClient, CommandHandler, ListenerHandler, AkairoHandler: { readdirRecursive } } = require("discord-akairo");
const { DiscordAPIError, MessageEmbed, TextChannel } = require("discord.js");

const path = require("path");
const knex = require("knex");

const items = require("./items");
const Database = require("./Database");

// Load extentions
readdirRecursive(path.join(__dirname, "extentions"))
	.filter(name => (/\.js$/).test(name))
	.forEach(file => require(file));

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
				database: process.env.MYSQL_DATABASE,
				typeCast: (field, next) => {
					if (field.type == "TINY" && field.length === 1) {
						const value = field.string();
						return value ? (value === "1") : null;
					}
					return next();
				},
				supportBigNumbers: true,
				bigNumberStrings: true
			}
		});

		this.minigamePlayers = new Set();
		/** @type {TextChannel} */
		this.guildDisplayChannel = null;
		/** @type {TextChannel} */
		this.partnerDisplayChannel = null;
		this.usersGuessing = new Set();
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
				table.bigInteger("guildID").unsigned();
				table.bigInteger("channelID").unsigned();
				table.bigInteger("hiddenByID").unsigned().notNullable();
				table.integer("usesLeft");
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

		if (!await this.knex.schema.hasTable("achievements")) {
			await this.knex.schema.createTable("achievements", table => {
				table.string("id").notNullable();
				table.bigInteger("userID").unsigned().notNullable();
				table.integer("tier").unsigned().notNullable();

				table.primary(["id", "userID", "tier"]);
			});
		}

		if (!await this.knex.schema.hasTable("userData")) {
			await this.knex.schema.createTable("userData", table => {
				table.bigInteger("userID").unsigned().primary();
				// TODO: we shouldn't have this
				table.string("userName").notNullable().defaultTo("[default username - this column should be removed]");

				table.integer("candyCanes").notNullable().defaultTo(0);
				table.integer("wrongGuesses").notNullable().defaultTo(0);

				// TODO: these are all also bad
				table.integer("firstFinder").notNullable().defaultTo(0);
				table.integer("totalPresents").notNullable().defaultTo(0);
				table.integer("lvl1Presents").notNullable().defaultTo(0);
				table.integer("lvl1Total").notNullable().defaultTo(0);
				table.integer("lvl2Presents").notNullable().defaultTo(0);
				table.integer("lvl2Total").notNullable().defaultTo(0);
				table.integer("lvl3Presents").notNullable().defaultTo(0);
				table.integer("lvl3Total").notNullable().defaultTo(0);
				table.integer("lvl4Presents").notNullable().defaultTo(0);
				table.integer("lvl4Total").notNullable().defaultTo(0);
				table.integer("lvl5Presents").notNullable().defaultTo(0);
				table.integer("lvl5Total").notNullable().defaultTo(0);
			});

		}


		if (!await this.knex.schema.hasTable("foundPresents")) {
			await this.knex.schema.createTable("foundPresents", table => {
				table.increments("id").primary();
				table.bigInteger("userID").unsigned().notNullable();
				table.string("userName").notNullable().defaultTo("[default username - this column should be removed]");
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
				table.bigInteger("displayMessageId").unsigned();
				table.boolean("isPartner").notNullable().defaultTo(false);
				table.boolean("appealed3Deny").notNullable().defaultTo(false);
				table.string("inviteURL");
			});
		}

		await Promise.all(items.map(item =>
			this.knex("itemsConfig").insert({ name: item.id, rank: item.rank }).onConflict("name").ignore()
		));
	}

	/**
	 * @returns {Promise<TextChannel?>} The server list channel.
	 */
	async getGuildDisplayChannel() {
		// TODO: THIS IS BAD! Eventually remember to make a configuration file for the channel IDs.
		try {
			const fetchedChannel = await this.channels.fetch("777012969842278402");
			if (!(fetchedChannel instanceof TextChannel)) throw new Error("The guild display channel is of the wrong type!");
			return this.guildDisplayChannel ?? (this.guildDisplayChannel = fetchedChannel);
		} catch (err) {
			if (err instanceof DiscordAPIError && err.code === 10003) return null;
			else throw err;
		}
	}
	/**
	 * @returns {Promise<TextChannel?>} The partnered server list channel.
	 */
	async getPartnerDisplayChannel() {
		// TODO: THIS IS BAD! Eventually remember to make a configuration file for the channel IDs.
		try {
			const fetchedChannel = await this.channels.fetch("777263455375720478");
			if (!(fetchedChannel instanceof TextChannel)) throw new Error("The guild display channel is of the wrong type!");
			return this.partnerDisplayChannel ?? (this.partnerDisplayChannel = fetchedChannel);
		} catch (err) {
			if (err instanceof DiscordAPIError && err.code === 10003) return null;
			else throw err;
		}
	}
	/**
	 *
	 * @param {import("discord.js").Guild} guild
	 * @returns {Promise<string?>} A generated invite.
	 */
	async getOrCreateInvite(guild) {
		const inviteURL = await this.database.getInviteURLIfExistsForGuild(guild);
		if (inviteURL) return inviteURL;
		const invite = await guild.channels.cache.first()?.createInvite({ maxAge: 0, unique: true });
		if (!invite) return "Not Found";
		await this.database.setInviteURLOfGuild(guild, invite.url);
		return invite.url;
	}
	/**
	 *
	 * @param {import("discord.js").Guild} guild
	 * @returns {Promise<MessageEmbed>} A generated message embed.
	 */
	async generateDisplayEmbedForGuild(guild) {
		const invite = await this.getOrCreateInvite(guild);
		const embed = new MessageEmbed()
			.setTitle(guild.name)
			.setDescription(`[Join!](${invite})`)
			.setThumbnail(guild.iconURL({ size: 512, dynamic: true }))
			.addField("");
		return embed;
	}
	/**
	 * @returns {Promise<void>}
	 */
	async setupGuildDisplayMessages() {
		const displayChannel = await this.getGuildDisplayChannel();
		if (displayChannel === null) throw new Error("No guild display channel was found! Please check the provided ID.");
		for (const guildData of await this.database.getAllGuilds()) {
			const displayMessageID = guildData.displayMessageId;
			const displayMessage = await (async() => {
				try {
					return displayMessageID && await displayChannel.messages.fetch(displayMessageID);
				} catch (err) {
					if (err instanceof DiscordAPIError && err.code === 10008) return null;
					throw err;
				}
			})();
			const { guildId: guildID } = guildData;
			const guild = await (() => {
				try {
					return this.guilds.fetch(guildID);
				} catch (err) {
					if (err instanceof DiscordAPIError && err.code === 10004) return null;
					throw err;
				}
			})();
			if (guild === null) continue;
			if (!displayMessage) {
				const msg = await displayChannel.send(await this.generateDisplayEmbedForGuild(guild));
				await this.knex.insert({
					displayMessageId: msg.id
				}).into("guildData").where({ guildID: guild.id });
			}
		}
	}
}
const client = new SantasElf();
client.login(process.env.TOKEN);

module.exports = {
	SantasElf
};
