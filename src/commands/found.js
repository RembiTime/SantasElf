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
		let tempPresent = false;
		let presentExpired = false;

		await this.client.knex.transaction(async trx => {
			[present] = await this.client.knex("presents")
				.select("timesFound", "hiddenByID", "presentLevel", "usesLeft")
				.where({ code })
				.transacting(trx)
				.forUpdate();

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
				if (present.usesLeft === 0) {
					presentExpired = true;
					return;
				} else if (present.usesLeft !== null) {
					await this.client.knex("presents").decrement("usesLeft", 1).where({ code: code }).transacting(trx);
					tempPresent = true;
				}

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
			}

		});

		if (!present) {
		// TODO: increment wrong guesses counter?
			await message.channel.send("That present does not exist!");
		} else if (finderIsHider) {
			await message.channel.send("You can't claim a present that you hid!");
		} else if (alreadyFound) {
			await message.channel.send("You've already claimed that present!");
		} else if (presentExpired) {
			await message.channel.send("This code has expired!");
		} else if (firstFinder && !tempPresent) {
			await message.channel.send(`You were the first one to find this present! It had a difficulty of \`${present.presentLevel}\`.`);
		} else {
			await message.channel.send(`You just claimed the present! It had a difficulty of \`${present.presentLevel}\`.`);
		}
	}
}


module.exports = FoundCommand;
