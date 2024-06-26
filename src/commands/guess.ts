import { Command } from "discord-akairo";
import { TextChannel } from "discord.js";
import channels from "../channels.json";

class GuessCommand extends Command {
	constructor() {
		super("guess", {
			aliases: ["guess", "g"],
			description: "Use this in a channel to start guessing",
			channel: "guild",
			args: [{
				id: "code",
				type: "string"
			}],
		});
	}

	async exec(message, { code }) {

		await message.delete();
		if (this.client.usersGuessing.has(message.author.id)) {
			message.author.send("You're already guessing! Please `,stop` before guessing somewhere else.");
			return;
		}
		if (code === null) {
			message.author.send("You are now guessing **" + message.guild.name + "**. Use `,stop` to stop guessing.");
		} else {
			message.author.send("Please do not input a code after the guess command! It might result in cheating\n\nYou are now guessing **" + message.guild.name + "**. Use `,stop` to stop guessing.");
		}
		await message.author.ensureDB();
		this.client.usersGuessing.add(message.author.id);

		// URGENT TODO: put something here so that the code will only run once the info is added to the DB. Applies to all database functions.

		let present;
		let finderIsHider = false;
		let alreadyFound = false;
		let firstFinder = false;
		let tempPresent = false;
		let presentExpired = false;
		let stopCollector = false;

		const filter = m => m.channel.type === "dm" && m.author.id !== this.client.user!.id;
		const dmChannel = await message.author.createDM();
		const collector = dmChannel.createMessageCollector(filter, { time: 900000 });
		collector.on("collect", async m => {
			if (m.content === ",stop") {
				this.client.usersGuessing.delete(message.author.id);
				stopCollector = true;
				collector.stop();
			}

			await this.client.knex.transaction(async trx => {
				[present] = await this.client.knex("presents")
					.select("timesFound", "hiddenByID", "presentLevel", "usesLeft")
					.where({ code: m.content, guildID: message.guild.id })
					.transacting(trx)
					.forUpdate();

				if (!present) {
					if (!stopCollector) {
						this.client.database.addLog(`${message.author.tag} guessed ${m.content} in ${message.guild.name}`);
						await this.client.knex("userData")
							.increment("wrongGuesses", 1)
							.transacting(trx)
							.where("userID", "=", m.author.id);
					}
					return;
				}

				this.client.usersGuessing.delete(message.author.id);
				collector.stop();

				if (m.author.id === present.hiddenByID) {
					this.client.database.addLog(`${message.author.tag} tried to guess their own present (${m.content}) in ${message.guild.name}`);
					finderIsHider = true;
					return;
				}

				const hasFound = await this.client.knex("foundPresents")
					.select(1)
					.where("userID", "=", m.author.id)
					.andWhere("presentCode", "=", m.content)
					.transacting(trx)
					.forUpdate()
					.then(([result]) => !!result);

				if (hasFound) {
					alreadyFound = true;
					return;
				} else {
					if (present.usesLeft === 0) {
						this.client.database.addLog(`${message.author.tag} tried to guess an expired present (${m.content}) in ${message.guild.name}`);
						presentExpired = true;
						return;
					} else if (present.usesLeft !== null) {
						this.client.database.addLog(`${message.author.tag} found a temporary present (${m.content}) in ${message.guild.name} - Uses left: ${--present.usesLeft}`);
						await this.client.knex("presents").decrement("usesLeft", 1).where({ code: m.content }).transacting(trx);
						tempPresent = true;
					} else {
						this.client.database.addLog(`${message.author.tag} found ${m.content} in ${message.guild.name}`);
					}

					await this.client.knex("foundPresents")
						.insert({
							userID: m.author.id,
							presentCode: m.content
						})
						.transacting(trx);

					let presentAmt = `lvl${present.presentLevel}Presents`;
					let presentTotal = `lvl${present.presentLevel}Total`;

					await this.client.knex("userData")
						.increment(presentAmt, 1)
						.increment(presentTotal, 1)
						.where({ userID: m.author.id })
						.transacting(trx);

					if (present.timesFound === 0) {
						firstFinder = true;
					}

					await this.client.knex("presents")
						.increment("timesFound", 1)
						.transacting(trx)
						.where("code", "=", m.content);

					if (firstFinder) {
						await this.client.knex("userData")
							.increment("firstFinder", 1)
							.transacting(trx)
							.where("userID", "=", m.author.id);
					}
				}

			});

			if (!present) {
				if (stopCollector) {
					await dmChannel.send("Guessing stopped. If you would like to open it again, please send `,g` in a channel again.");
				} else {
					await dmChannel.send("That present does not exist!");
				}
			} else if (finderIsHider) {
				await dmChannel.send("You can't claim a present that you hid!");
			} else if (alreadyFound) {
				await dmChannel.send("You've already claimed that present!");
			} else if (presentExpired) {
				await dmChannel.send("This code has expired!");
			} else if (firstFinder && !tempPresent) {
				const publicLogs = await this.client.channels.cache.get(channels.publicLogs) as TextChannel;
				let { guild } = message;
				publicLogs.send("**" + message.author.tag + "** was the first one to find a level " + present.presentLevel + " present in **" + guild.name + "**");
				await dmChannel.send(`You were the first one to find this present! It had a difficulty of \`${present.presentLevel}\`.`);
			} else {
				const publicLogs = await this.client.channels.cache.get(channels.publicLogs) as TextChannel;
				let { guild } = message;
				publicLogs.send("**" + message.author.tag + "** just found a level " + present.presentLevel + " present in **" + guild.name + "**");
				await dmChannel.send(`You just claimed the present! It had a difficulty of \`${present.presentLevel}\`.`);
			}
			if (present?.guildID) await this.client.updateDisplayForGuild(present.guildID);
		});
		collector.on("end", () => {
			this.client.usersGuessing.delete(message.author.id);
		});
	}
}


export = GuessCommand;
