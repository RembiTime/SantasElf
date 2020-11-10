const { Command } = require("discord-akairo");

class FoundCommand extends Command {
	constructor() {
		super("found", {
			aliases: ["found"],
			description: "Command to be used when you find a present",
			args: [{
				id: "code",
				type: "string"
			}]
		});
	}

	async exec(message, { code }) {
		await message.author.ensureDB();

		// URGENT TODO: put something here so that the code will only run once the info is added to the DB. Applies to all database functions.

		let present;
		let finderIsHider = false;
		let alreadyFound = false;
		let firstFinder = false;

		await this.client.knex.transaction(async trx => {
			present = await this.client.knex("presents")
				.select("timesFound", "hiddenByID", "presentLevel")
				.where({ code, guildID: message.guild.id })
				.transacting(trx)
				.forUpdate()
				.then(([present]) => present ?? null);

			if (!present) {
				return;
			}

			if (message.author.id === present.hiddenByID) {
				finderIsHider = true;
				return;
			}

			const hasFound = await this.client.knex("foundPresents")
				.select(1)
				.where("userID", "=", message.author.id)
				.andWhere("presentCode", "=", code)
				.transacting(trx)
				.forUpdate()
				.then(([result]) => !!result);

			if (hasFound) {
				alreadyFound = true;
				return;
			} else {
				const results = await this.client.knex("presents").select("*").where({ code: code });
				if (results[0].usesLeft === 0) {
					message.channel.send("This code has expired!");
				}
				await this.client.knex("presents").decrement("usesLeft", 1).where({ code: "abc123" });
				await this.client.knex("foundPresents")
					.insert({
						userID: message.author.id,
						presentCode: code
					})
					.transacting(trx);

				let presentAmt = `lvl${present.presentLevel}Presents`;
				let presentTotal = `lvl${present.presentLevel}Total`;

				await this.client.knex("userData")
					.increment(presentAmt, 1)
					.increment(presentTotal, 1)
					.transacting(trx);

				if (present.timesFound === 0) {
					firstFinder = true;
				}

				if (present === null) {
					// TODO: increment wrong guesses counter?
					await message.channel.send("That present does not exist!");
				} else if (finderIsHider) {
					await message.channel.send("You can't claim a present that you hid!");
				} else if (alreadyFound) {
					await message.channel.send("You've already claimed that present!");
				} else if (firstFinder) {
					await message.channel.send(`You were the first one to find this present! It had a difficulty of \`${present.presentLevel}\`.`);
				} else {
					await message.channel.send(`You just claimed the present! It had a difficulty of \`${present.presentLevel}\`.`);
				}
			}
		});
	}
}

module.exports = FoundCommand;
