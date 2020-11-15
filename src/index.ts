import dotenv from "dotenv";
dotenv.config();

import { AkairoClient, CommandHandler, ListenerHandler, AkairoHandler } from "discord-akairo";
import { DiscordAPIError, MessageEmbed, TextChannel } from "discord.js";

import path from "path";
import knex from "knex";

import items = require("./items");
import Database from "./Database";

// Load extentions
AkairoHandler.readdirRecursive(path.join(__dirname, "extentions"))
	.filter(name => (/\.js$/).test(name))
	.forEach(file => require(file));

interface Extension {
	commandHandler: CommandHandler;
	listenerHandler: ListenerHandler;
	database: Database;
	knex: knex;

	minigamePlayers: Set<string>;
	usersGuessing: Set<string>;
	guildDisplayChannel: TextChannel;
	partnerDisplayChannel: TextChannel;
}

class SantasElf extends AkairoClient implements Extension {
	public commandHandler = new CommandHandler(this, {
		directory: path.join(__dirname, "commands"),
		prefix: ","
	});

	public listenerHandler = new ListenerHandler(this, {
		directory: path.join(__dirname, "listeners"),
	});

	public database = new Database(this, {
		host: process.env.MYSQL_HOST,
		port: parseInt(process.env.MYSQL_PORT),
		user: process.env.MYSQL_USERNAME,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE
	});

	public knex = knex({
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

	public minigamePlayers: Set<string> = new Set();
	public usersGuessing: Set<string> = new Set();
	public guildDisplayChannel: TextChannel = null;
	public partnerDisplayChannel: TextChannel = null;

	constructor() {
		super(
			{ ownerID: process.env.OWNER_IDS.split(",") },
			{ partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION" ] }
		);

		this.commandHandler.loadAll();
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.loadAll();
	}

	async login(token: string) {
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
			await this.knex.raw("ALTER TABLE itemsConfig ADD CONSTRAINT CHECK (`rank` >= 0 AND `rank` <= 6)");
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
	async getPartnerDisplayChannel(): Promise<TextChannel | null> {
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
		const presents = await this.database.getPresentsForGuild(guild.id);
		/** @type [string, import("./typings/tables").PresentRow[]][] */
		const groupedPresents = Object.entries(presents.reduce((l, c) => (l[c.presentLevel] ? l[c.presentLevel].push(c) : l[c.presentLevel] = [c], l), {}));
		const embed = new MessageEmbed()
			.setTitle(guild.name)
			.setDescription(`[Join!](${invite})`)
			.setThumbnail(guild.iconURL({ size: 512, dynamic: true }))
			.addField("Total Present Count", presents.length);
		for (const [level, presents] of groupedPresents) embed.addField(`Level ${level} Presents`, (presents as any /* TODO */).length, true);
		if (this.database.isPartner(guild.id)) {
			embed.setColor(0x789fbf);
		} else embed.setColor(0x949494);
		return embed;
	}
	/**
	 * @returns {Promise<void>}
	 */
	async setupGuildDisplayMessages() {
		for (const guildData of await this.database.getAllGuilds()) {
			await this.updateDisplayForGuild(guildData.guildId);
		}
	}

	async updateDisplayForGuild(guildID) {
		const displayChannel = await this.getGuildDisplayChannel();
		if (displayChannel === null) throw new Error("No guild display channel was found! Please check the provided ID.");
		const partnerChannel = await this.getPartnerDisplayChannel();
		if (partnerChannel === null) throw new Error("No partnered guild display channel was found! Please check the provided ID.");
		const guildData = await this.database.getGuildDataById(guildID);
		const { displayMessageId } = guildData;
		const channel = guildData.isPartner ? partnerChannel : displayChannel;
		const displayMessage = await (async() => {
			try {
				return displayMessageId && await channel.messages.fetch(displayMessageId);
			} catch (err) {
				if (err instanceof DiscordAPIError && err.code === 10008) return null;
				throw err;
			}
		})();
		const guild = await (() => {
			try {
				return this.guilds.fetch(guildID);
			} catch (err) {
				if (err instanceof DiscordAPIError && err.code === 10004) return null;
				throw err;
			}
		})();
		if (guild === null) return;
		const embed = await this.generateDisplayEmbedForGuild(guild);
		if (!displayMessage) {
			const msg = await channel.send(embed);
			await this.knex("guildData").update({
				displayMessageId: msg.id
			}).where({ guildID: guild.id });
		} else await displayMessage.edit(embed);
	}
}

declare module "discord.js" {
	interface Client extends Extension {}
}

const client = new SantasElf();
client.login(process.env.TOKEN);


module.exports = {
	SantasElf
};
