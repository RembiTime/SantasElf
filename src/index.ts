import dotenv from "dotenv";
dotenv.config();

import { AkairoClient, CommandHandler, ListenerHandler, AkairoHandler } from "discord-akairo";
import { DiscordAPIError, MessageEmbed, TextChannel } from "discord.js";
import type { PresentRow } from "./typings/tables";
import path from "path";
import knex from "knex";

import { items } from "./items";
import Database = require("./Database");

import channels from "./channels.json";
// Load extensions
AkairoHandler.readdirRecursive(path.join(__dirname, "extensions"))
	.filter(name => (/\.js$/).test(name))
	.forEach(file => require(file));

export interface Extension {
	commandHandler: CommandHandler;
	listenerHandler: ListenerHandler;
	database: Database;
	knex: knex;

	minigamePlayers: Set<string>;
	usersGuessing: Set<string>;
	guildDisplayChannel: TextChannel;
	partnerDisplayChannel: TextChannel;

	updateDisplayForGuild(guildID: string): Promise<void>;
}

export class SantasElf extends AkairoClient implements Extension {
	public commandHandler = new CommandHandler(this, {
		directory: path.join(__dirname, "commands"),
		prefix: ","
	});

	public listenerHandler = new ListenerHandler(this, {
		directory: path.join(__dirname, "listeners"),
	});

	public database = new Database(this, {
		host: process.env.MYSQL_HOST,
		port: parseInt(process.env.MYSQL_PORT!),
		user: process.env.MYSQL_USERNAME,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE
	});

	public knex = knex({
		client: "mysql2",
		connection: {
			host: process.env.MYSQL_HOST,
			port: parseInt(process.env.MYSQL_PORT!),
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

	// TODO: check
	public guildDisplayChannel: TextChannel = null!;
	public partnerDisplayChannel: TextChannel = null!;

	constructor() {
		super(
			{ ownerID: process.env.OWNER_IDS!.split(",") },
			{ partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION" ] }
		);

		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler
		});

		this.commandHandler.loadAll();
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
				// TODO: change `name` to `id`
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
				table.integer("candyCanes").notNullable().defaultTo(0);
				table.integer("wrongGuesses").unsigned().notNullable().defaultTo(0);

				// TODO: these are all also bad
				table.integer("firstFinder").unsigned().notNullable().defaultTo(0);
				table.integer("totalPresents").unsigned().notNullable().defaultTo(0);
				table.integer("lvl1Presents").unsigned().notNullable().defaultTo(0);
				table.integer("lvl1Total").unsigned().notNullable().defaultTo(0);
				table.integer("lvl2Presents").unsigned().notNullable().defaultTo(0);
				table.integer("lvl2Total").unsigned().notNullable().defaultTo(0);
				table.integer("lvl3Presents").unsigned().notNullable().defaultTo(0);
				table.integer("lvl3Total").unsigned().notNullable().defaultTo(0);
				table.integer("lvl4Presents").unsigned().notNullable().defaultTo(0);
				table.integer("lvl4Total").unsigned().notNullable().defaultTo(0);
				table.integer("lvl5Presents").unsigned().notNullable().defaultTo(0);
				table.integer("lvl5Total").unsigned().notNullable().defaultTo(0);
			});

		}


		if (!await this.knex.schema.hasTable("foundPresents")) {
			await this.knex.schema.createTable("foundPresents", table => {
				table.increments("id").primary();
				table.bigInteger("userID").unsigned().notNullable();
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
				table.bigInteger("displayMessageID").unsigned();
				table.boolean("isPartner").notNullable().defaultTo(false);
				table.boolean("appealed3Deny").notNullable().defaultTo(false);
				table.string("inviteURL");
			});
		}

		if (!await this.knex.schema.hasTable("eggData")) {
			await this.knex.schema.createTable("eggData", table => {
				table.increments("eggID").primary();
				table.bigInteger("userID").unsigned();
				table.bigInteger("timeFound").unsigned();
				table.enum("status", ["UNCLAIMED", "CLAIMED", "LOST"]).notNullable();
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
			const fetchedChannel = await this.channels.fetch(channels.publicQueue);
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
		try {
			const fetchedChannel = await this.channels.fetch(channels.partnerQueue);
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
		const invite = await guild.channels.cache.find(x => x.type === "text")?.createInvite({ maxAge: 0, unique: true });
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
		const groupedPresents: [string, PresentRow[]][] = Object.entries(presents.reduce((l, c) => (l[c.presentLevel] ? l[c.presentLevel].push(c) : l[c.presentLevel] = [c], l), {}));
		const embed = new MessageEmbed()
			.setTitle(guild.name)
			.setDescription(`[Join!](${invite})`)
			.setThumbnail(guild.iconURL({ size: 512, dynamic: true }))
			.addField("Total Present Count", presents.length);
		for (const [level, presents] of groupedPresents) embed.addField(`Level ${level} Presents`, presents.length, true);
		embed.addField("Total Presents Found", presents.reduce((l, c: PresentRow) => l + c.timesFound, 0));
		if (this.database.isPartner(guild.id)) {
			embed.setColor(0x789fbf);
		} else embed.setColor(0x949494);
		return embed;
	}
	async setupGuildDisplayMessages() {
		for (const guildData of await this.database.getAllGuilds()) {
			await this.updateDisplayForGuild(guildData.guildID);
		}
	}

	async updateDisplayForGuild(guildID: string) {
		const displayChannel = await this.getGuildDisplayChannel();
		if (displayChannel === null) throw new Error("No guild display channel was found! Please check the provided ID.");
		const partnerChannel = await this.getPartnerDisplayChannel();
		if (partnerChannel === null) throw new Error("No partnered guild display channel was found! Please check the provided ID.");
		const guildData = await this.database.getGuildDataFromID(guildID);
		if (guildData === null) return;
		const { displayMessageID } = guildData;
		const channel = guildData.isPartner ? partnerChannel : displayChannel;
		const displayMessage = await (async() => {
			try {
				return displayMessageID && await channel.messages.fetch(displayMessageID);
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
				displayMessageID: msg.id
			}).where({ guildID: guild.id });
		} else await displayMessage.edit(embed);
	}
}

declare module "discord.js" {
	interface Client extends Extension {}
}

const client = new SantasElf();
client.login(process.env.TOKEN!);


