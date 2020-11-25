const mysql = require("mysql2");
const items = require("./items");
const util = require("util");
const { appendFile, mkdir } = require("fs/promises");
const { existsSync } = require("fs");
const { join } = require("path");
/** @typedef {import("./typings/tables").GuildDataRow} GuildDataRow */
/** @typedef {import("./typings/tables").UserDataRow} UserDataRow */
/** @typedef {import("./typings/tables").StaffApprovalRow} StaffApprovalRow */

class Database {
	/**
	 * @param {import(".").SantasElf} client
	 * @param {mysql.PoolOptions} options
	 */
	constructor(client, options) {
		this.client = client;
		this.pool = mysql.createPool({ ...options, supportBigNumbers: true, bigNumberStrings: true }).promise();
	}
	/**
	 *
	 * @param {{ id: string } | { code: string }} options
	 */
	async getPresent(options) {
		if ("id" in options) {
			const [results] = await this.client.knex.select("*").from("presents").where({ id: options.id });
			return results ?? null;
		} else if ("code" in options) {
			// TODO: Handle multiple presents with same code at different times in one guild?
			const [results] = await this.client.knex.select("*").from("presents").where({ code: options.code });
			return results ?? null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}
	/**
	 * @param {{ guildID: string }} guildID
	 * @returns {Promise<GuildDataRow?>}
	 * @deprecated
	 */

	async checkNewGuild({ guildID }) {
		//if ("id" in options) {
		const [results] = await this.client.knex.select("*").from("guildData").where({ guildID });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async addLog(msg) {
		if ((!existsSync(join(__dirname,"../logs/")))) await mkdir(join(__dirname,"../logs/"));
		await appendFile(join(__dirname,"../logs/log.txt"), msg + "\n");
		console.log(msg);
	}

	async checkPresentUses({ code }) {
		//if ("id" in options) {
		const [results] = await this.client.knex.select("*").from("presents").where({ code });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async subtractUse({ code }) {
		//if ("id" in options) {
		await this.client.knex("userData")
			.decrement("usesLeft", 1)
			.where("code", "=", code);
		const [checkZero] = await this.client.knex.select("usesLeft as uses").from("presents").where({ code });
		if (checkZero.uses === 0) {
			await this.client.knex("presents")
				.where("code", "=", code)
				.del();
		}
		return;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}
	/**
	 * @param {{ guildID: string }} guildID
	 * @deprecated
	 */
	async checkIfPartner({ guildID }) {
		//yes, it's the exact same as above but with a different name :<
		const [results] = await this.client.knex.select("*").from("guildData").where({ guildID });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}
	/**
	 * @param {string} guildID
	 * @returns {Promise<boolean>}
	 */
	async isPartner(guildID) {
		const [results] = await this.client.knex.select("isPartner").from("guildData").where({ guildID });
		return results ?? null;
	}
	/**
	 * @param {{guildID: string}} guildID
	 * @returns {Promise<string?>}
	 */
	async getGuildDisplayMessageID({ guildID }) {
		const [results] = await this.client.knex.select("displayMessageID").from("guildData").where({ guildID });
		return results ?? null;
	}

	/**
	 * @returns {Promise<GuildDataRow[]>} An array of guildData entries.
	 */
	async getAllGuilds() {
		const [results] = await this.client.knex.select("*").from("guildData");
		return results;
	}

	/**
	 * @param {import("discord.js").Guild} guild
	 * @returns {Promise<GuildDataRow["inviteURL"]?>}.
	 */
	async getInviteURLIfExistsForGuild(guild) {
		/** @type {GuildDataRow[]} */
		const results = await this.client.knex.select("inviteURL")
			.from("guildData")
			.where({ guildID: guild.id });
		return results[0]?.inviteURL ?? null;
	}
	/**
	 * @param {import("discord.js").Guild} guild
	 * @param {string} inviteURL
	 * @returns {Promise<void>}
	 */
	async setInviteURLOfGuild(guild, inviteURL) {
		await this.client.knex("guildData")
			.update({ inviteURL })
			.where({ guildID: guild.id });
	}

	async checkStaffApprovalIDs(options) {
		if ("messageID" in options) {
			//Check if message is stored
			const [newGuild] = await this.client.knex.select("*").from("staffApproval").where({ messageID: options.messageID });
			return newGuild ?? null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkApprovalIfOngoing(options) {
		if ("messageID" in options) {
			//Check if message is stored
			const [results] = await this.client.knex.select("*").from("staffApproval").where({ messageID: options.messageID, status: "ONGOING" });
			return results ?? null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkOngoingIfCodeDupe(options) {
		if ("code" in options) {
			//Check if message is stored
			const [newGuild] = await this.client.knex.select("*").from("staffApproval").where({ code: options.code, status: "ONGOING" });
			return newGuild ?? null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async findIfDupe(options) {
		//if ("id" in options) {
		const [results] = await this.client.knex.select("*").from("foundPresents").where({ userID: options.userID, presentCode: options.presentCode });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}
	/**
	 * @param {{ userID: string }} userID
	 * @returns {Promise<UserDataRow?>}
	 */
	async userDataCheck({ userID }) {
		//if ("id" in options) {
		const [results] = await this.client.knex.select("*").from("userData").where({ userID });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async userHasItem({ userID, itemName }) {
		const [results] = await this.client.knex.select(1).from("items").where({ name: itemName, userID: userID });
		return !!results;
	}

	async itemCheck({ userID, itemName }) {
		//if ("id" in options) {
		const [results] = await this.client.knex.select("*").from("items").where({ name: itemName, userID: userID });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}
	/**
	 * @param {{ messageID: string }} messageID
	 * @returns {Promise<StaffApprovalRow>}
	 * @deprecated
	 */
	async findIfClaimedBy({ messageID }) {
		//if ("id" in options) {
		const [results] = await this.client.knex.select("*").from("staffApproval").where({ messageID });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	/**
	 * @param {string} messageID
	 * @returns {Promise<StaffApprovalRow>}
	 */
	async getStaffApprovalFromMessageID(messageID) {
		const [result] = await this.client.knex.select("*").from("staffApproval").where({ messageID });
		return result;
	}
	/**
	 * @deprecated
	 * @param {{ guildID: string }} guildID
	 * @returns {Promise<GuildDataRow?>}
	 */
	async findIfGuildExists({ guildID }) {
		//if ("id" in options) {
		const [results] = await this.client.knex.select("*").from("guildData").where({ guildID });
		return results ?? null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}
	/**
	 * @param {string} guildID
	 * @returns {Promise<GuildDataRow?>}
	 */
	async getGuildDataFromID(guildID) {
		return (await this.client.knex("guildData").where({ guildID }))?.[0] ?? null;
	}


	async getAllItems({ userID }) {
		const results = await this.client.knex.select("*").from("items").where({ userID });
		return results.map(({ name, amount, record }) => ({
			item: items.find(e => e.id === name),
			amount,
			record
		}));
	}

	async checkAchievement({ name, userID }) {
		const [results] = await this.client.knex.select("*").from("achievements").where({ userID, name });
		const checkHas = results ?? null;
		if (checkHas !== null) {
			return true;
		} return false;
	}

	async addPresent({ code, presentLevel, timesFound, guildID, channelID, hiddenByID, usesLeft }) {
		await this.client.knex("presents").insert({ code, presentLevel, timesFound, guildID, channelID, hiddenByID, usesLeft });
	}

	async presentFound({ userID, presentCode }) {
		await this.client.knex("foundPresents").insert({ userID, presentCode });
	}

	async addNewUser({ userID }) {
		await this.client.knex("userData").insert({ userID, candyCanes: 0, wrongGuesses: 0, firstFinder: 0, totalPresents: 0, lvl1Presents: 0, lvl1Total: 0, lvl2Presents: 0, lvl2Total: 0, lvl3Presents: 0, lvl3Total: 0, lvl4Presents: 0, lvl4Total: 0, lvl5Presents: 0, lvl5Total: 0 });
	}

	async addStaffApprovalID({ messageID, status, code, presentLevel, guildID, channelID, hiddenByID }) {
		await this.client.knex("staffApproval").insert({ messageID, status, code, presentLevel, guildID, channelID, hiddenByID });
	}

	async addNewGuild({ guildID }) {
		await this.client.knex.insert({
			guildID
		}).into("guildData");
	}

	async notClaimed({ messageID }) {
		await this.client.knex("staffApproval").where({ messageID }).update({ claimedByID: null });
	}

	async claimedUpdate({ userID, messageID }) {
		await this.client.knex("staffApproval").where({ messageID }).update({ claimedByID: userID });
	}

	async approvalStatusUpdate({ status, messageID }) {
		await this.client.knex("staffApproval").where({ messageID }).update({ status });
	}

	async addPartner({ guildID }) {
		await this.client.knex("guildData").where({ guildID }).update({ isPartner: "TRUE" });
	}

	async changeLevel({ presentLevel, messageID }) {
		await this.client.knex("staffApproval").where({ messageID }).update({ presentLevel });
	}

	async appealAccept({ guildID }) {
		await this.client.knex("guildData").where({ guildID }).update({ appealed3Deny: "TRUE" });
	}

	async addUserPresent({ presentLevel, userID }) {
		let presentAmt = "lvl" + presentLevel + "Presents";
		let presentTotal = "lvl" + presentLevel + "Total";
		await this.client.knex("userData").where({ userID }).increment({ [presentAmt]: 1, [presentTotal]: 1 });
	}

	async getGlobalStats() {
		const [wrongGuesses, usersWithPresents, guildsWithPresents, presentsFound] = await Promise.all([
			this.getGlobalWrongGuesses(),
			this.getGlobalUsersWithPresents(),
			this.getGlobalGuildsWithPresents(),
			this.getGlobalPresentsFound()
		]);

		return { wrongGuesses, usersWithPresents, guildsWithPresents, presentsFound };
	}

	async getGlobalWrongGuesses() {
		const [[result]] = await this.client.knex.sum("wrongGuesses").from("userData");
		return result;
	}

	async getGlobalUsersWithPresents() {
		const [{ count: result }] = await this.client.knex.countDistinct("userID").from("foundPresents");
		return result;
	}

	async getGlobalGuildsWithPresents() {
		const [{ count: result }] = await this.client.knex.countDistinct("guildID").from("presents");
		return result;
	}

	async getGlobalPresentsFound() {
		const [{ count: result }] = await this.client.knex.countDistinct("presentCode").from("foundPresents");
		return result;
	}

	async checkGuildDeniedAmount({ guildID }) {
		const [{ count: result }] = await this.client.knex.count("* as count").from("staffApproval").where({
			status: "DENIED",
			guildID
		});
		return result;
	}

	async checkIfPendingPresent({ guildID }) {
		const [{ count: result }] = await this.client.knex.count("* as count").from("staffApproval").where({
			status: "ONGOING",
			guildID
		});
		return result;
	}
	/**
	 * @param {{ guildID: string }} guildID
	 * @deprecated
	 */
	async checkPresentAmount({ guildID }) {
		const [{ count: result }] = await this.client.knex.count("* as count").from("presents").where({
			guildID
		});
		return result ?? null;
	}
	/**
	 * @param {string} guildID
	 */
	async getPresentAmountForGuild(guildID) {
		const [{ count: result }] = await this.client.knex.count("* as count").from("presents").where({
			guildID
		});
		return result;
	}
	/**
	 * @param {string} guildID
	 * @returns {Promise<import("./typings/tables").PresentRow[]>}
	 */
	async getPresentsForGuild(guildID) {
		return this.client.knex.select("*").from("presents").where({ guildID });
	}

	// ITEM STUFF

	async addCandyCanes({ amount, userID }) {
		await this.client.knex("userData").where({ userID }).increment({ candyCanes: amount });
	}

	async addItem({ itemName, userID, presentLevel }) {
		presentLevel = "lvl" + presentLevel + "Presents";
		await this.client.knex("items")
			.insert({ name: itemName, userID, amount: 1, record: 1 })
			.onConflict("userID")
			.merge({
				amount: this.client.knex.raw("amount + 1"),
				record: this.client.knex.raw("GREATEST(amount, record)")
			});
		/* Keeping just in case...
		await this.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, [itemName, userID]); */
		await this.client.knex("userData").where({ userID }).decrement({ [presentLevel]: 1 });
	}

	async foundAchievement({ achName, userID, message }) {
		let present;

		await this.client.knex.transaction();
		present = await this.client.knex("achievements")
			.select("name", "userID")
			.where({ name: achName, userID: userID })
			.then(results => results.length ? results[0] : null);

		if (!present) {
			await this.client.knex("achievements").insert({ name: achName, userID });
			//We might need a race condition check
			message.channel.send("✨ Achievement Unlocked: **" + achName + "**! You can view all your achievements with `,achievements`. ✨");
			return 1;
		} return 0;
	}

	async removeItem({ itemName, userID }) {
		await this.client.knex("items").where({ name: itemName, userID }).decrement({ amount: 1 });
	}

	removePresent({ userData, presentLevel }) {
		if (presentLevel == 1) {
			if (userData.lvl1Presents < 1) {
				return 0;
			} else {
				//await this.pool.execute("UPDATE userData SET lvl1Presents = lvl1Presents - 1 WHERE userID = ?", [userID]);
				return 1;
			}
		} else if (presentLevel == 2) {
			if (userData.lvl2Presents < 1) {
				return 0;
			} else {
				//await this.pool.execute("UPDATE userData SET lvl2Presents = lvl2Presents - 1 WHERE userID = ?", [userID]);
				return 1;
			}
		} else if (presentLevel == 3) {
			if (userData.lvl3Presents < 1) {
				return 0;
			} else {
				//await this.pool.execute("UPDATE userData SET lvl3Presents = lvl3Presents - 1 WHERE userID = ?", [userID]);
				return 1;
			}
		} else if (presentLevel == 4) {
			if (userData.lvl4Presents < 1) {
				return 0;
			} else {
				//await this.pool.execute("UPDATE userData SET lvl4Presents = lvl4Presents - 1 WHERE userID = ?", [userID]);
				return 1;
			}
		} else if (presentLevel == 5) {
			if (userData.lvl5Presents < 1) {
				return 0;
			} else {
				//await this.pool.execute("UPDATE userData SET lvl5Presents = lvl5Presents - 1 WHERE userID = ?", [userID]);
				return 1;
			}
		} else {
			return 2;
		}
	}

	async agivePresent({ userID, presentLevel, amount }) {
		if (presentLevel == 1) {
			await this.client.knex("userData").where({ userID }).increment({ lvl1Presents: amount });
		} else if (presentLevel == 2) {
			await this.client.knex("userData").where({ userID }).increment({ lvl2Presents: amount });
		} else if (presentLevel == 3) {
			await this.client.knex("userData").where({ userID }).increment({ lvl3Presents: amount });
		} else if (presentLevel == 4) {
			await this.client.knex("userData").where({ userID }).increment({ lvl4Presents: amount });
		} else if (presentLevel == 5) {
			await this.client.knex("userData").where({ userID }).increment({ lvl5Presents: amount });
		}
	}

	async checkBigTriangle({ userID, message }) {
		// this doesn't work yet
		if (process.env.TOKEN) { return false; }
		/** @type {*} */
		const [result] = /** @type {HTMLElement} */ await this.pool.execute(`
			START TRANSACTION;

			SELECT (mysteriousPartAmt, fractalAmt, spannerAmt, slimeAmt, dragonAmt)
				INTO (parts, fractals, spanners, slimes, dragon)
				FROM userData WHERE userID = ?
				FOR UPDATE;

			IF (parts >= 3 AND fractals >= 1 AND spanners >= 1 AND slimes >= 1 AND dragon >= 1) THEN
				UPDATE userData SET
					mysteriousPartAmt = mysteriousPartAmt - 3,
					fractalAmt = fractalAmt - 1,
					spannerAmt = spannerAmt - 1,
					slimeAmt = slimeAmt - 1,
					dragonAmt = dragonAmt - 1
					bigTriangleAmt = bigTriangleAmt + 1;

				SELECT TRUE AS result;
			ELSE
				SELECT FALSE AS result;
			END IF

			COMMIT;
		`, [userID]);

		if (result.result) {
			await message.channel.send("**What is happening? Your 3 mysterious parts, and fractal move together to form a weird looking 3D triangle shape. Once they are in position, the cyber dragon figurine awakens and upon seeing the parts, uses the slime and the spanner to secure the pieces into place. The object starts to glow and then floats up into the air. Congratulations, you've made the legendary Big Triangle!**");
		}
	}

	generateRarity({ presentLevel }) {
		// Rows are weights for present ranks for different present levels
		const weights = [
			[10, 45, 25, 15, 4, 1],
			[10, 35, 25, 20, 8, 2],
			[10, 25, 25, 25, 12, 3],
			[10, 15, 20, 30, 20, 5],
			[10, 10, 15, 20, 30, 15]
		][presentLevel - 1];

		const cumulativeDist = weights.slice(1).reduce((result, val) => {
			result.push(result[result.length - 1] + val);
			return result;
		}, [weights[0]]);

		const max = cumulativeDist[cumulativeDist.length - 1];
		const rand = Math.random() * max;

		const result = cumulativeDist.findIndex(val => val >= rand);

		if (result === -1) {
			throw new Error("This should never be executed");
		}

		return result;
	}

	async choosePresent({ message, presentLevel, userID }) {
		const presentRarity = this.client.database.generateRarity({ presentLevel });
		const candidates = items.filter(e => e.rank === presentRarity);
		const item = candidates[Math.floor(Math.random() * candidates.length)];

		if (item.defaultBehavior !== false) {
			await this.addItem({ itemName: item.id, userID, presentLevel });
		} else if (item.defaultBehavior === false) {
			let lvlPresents = "lvl" + presentLevel + "Presents";
			await this.client.knex("userData").where({ userID }).decrement({ [lvlPresents]: 1 });
		}

		if (typeof item.onFind === "function") {
			await item.onFind(this.client, message);
		}

		if (item.response) {
			await message.channel.send(item.response);
		}
	}

	async useMistletoe({ message }) {
		let kissMessage = await message.channel.send("Who would you like to kiss?");
		const filter = m => m.author.id === message.author.id;
		const mentionMsg = (await message.channel.awaitMessages(filter, { max: 1, time: 120000 }));
		if (mentionMsg.size === 0) {
			message.channel.send("You didn't answer in time! Please run the command again to try again.");
			return;
		}
		if (mentionMsg.first().mentions.users.size === 1) {
			let kissedID = mentionMsg.first().mentions.users.first().id;
			if (kissedID === message.author.id) {
				message.channel.send("You can't kiss yourself!");
				return;
			}
			message.delete();
			kissMessage.delete();
			await mentionMsg.first().delete();
			message.channel.send("<@" + message.author.id + "> kissed <@" + kissedID + ">! Congrats! (You both get 15 candy canes!)");
			const newUserCheck = this.client.database.userDataCheck({ userID: kissedID });
			if (newUserCheck === null) {
				await this.client.database.addNewUser({
					userID: kissedID
				});
			}
			await this.client.knex("userData").where({ userID: message.author.id }).increment({ candyCanes: 15 });
			await this.client.knex("userData").where({ userID: kissedID }).increment({ candyCanes: 15 });
			await this.client.knex("items").where({ name: "mistletoe", userID: message.author.id }).decrement({ amount: 1 });
			return;
		} if (mentionMsg.first().mentions.users.size > 1) {
			message.channel.send("Please only mention one user!");
			return;
		} if (mentionMsg.first().mentions.users.size === 0) {
			message.channel.send("Please mention someone to kiss!");
		}
	}

	async useMeme({ message }) {
		let candyCaneAmt = Math.floor(Math.random() * 41) - 10;
		await this.client.knex("items").where({ name: "meme", userID: message.author.id }).decrement({ amount: 1 });
		if (candyCaneAmt === 0) {
			message.channel.send("Well, looks like your meme got lost in new and nobody saw it.");
			return;
		} if (candyCaneAmt < 0) {
			let positiveNum = Math.abs(candyCaneAmt);
			message.channel.send("Wow, people did not like your meme! You lost " + positiveNum + " candy canes! Welcome to controversial.");
			await this.client.knex("userData").where({ userID: message.author.id }).decrement({ candyCanes: positiveNum });
			return;
		} if (candyCaneAmt > 0 && candyCaneAmt <= 15) {
			message.channel.send("People liked your meme, which made it to hot! You gained " + candyCaneAmt + " candy canes!");
			await this.client.knex("userData").where({ userID: message.author.id }).decrement({ candyCanes: candyCaneAmt });
			return;
		} if (candyCaneAmt > 15) {
			message.channel.send("People loved your meme, which made it to the top posts! You gained " + candyCaneAmt + " candy canes!");
			await this.client.knex("userData").where({ userID: message.author.id }).decrement({ candyCanes: candyCaneAmt });
			return;
		}
	}

	async usePalette({ message }) {
		this.client.minigamePlayers.add(message.author.id);
		let colorArray = ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬜", "⬛", "🟫",];
		colorArray = colorArray.sort(() => Math.random() - 0.5);
		let finalArray = this.stringInsert(colorArray, 3).map(x => x.join("")).join("\n");
		let answer = Math.floor(Math.random() * 9);
		const lookupMap = {
			"🟥": "red",
			"🟧": "orange",
			"🟨": "yellow",
			"🟩": "green",
			"🟦": "blue",
			"🟪": "purple",
			"⬜": "white",
			"⬛": "black",
			"🟫": "brown",
		};
		const answerString = lookupMap[colorArray[answer]];
		let sent = await message.channel.send(finalArray);
		const botMessage = await message.channel.messages.fetch(sent.id);
		let seconds = 10;
		const msg = await message.channel.send(`Memorize these colors, they will disappear in ${seconds} seconds`);
		const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
		for (const x of numberEmojis) botMessage.react(x);
		const timer = setInterval(async () => {
			seconds = seconds - 2;
			await msg.edit(`Memorize these colors, they will disappear in ${seconds} seconds`);
			if (seconds <= 0) {
				clearInterval(timer);
				sent.edit("1️⃣2️⃣3️⃣\n4️⃣5️⃣6️⃣\n7️⃣8️⃣9️⃣");
				await msg.edit("Click which number " + answerString + " was");
				const filter = (reaction, user) => {
					return ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"].includes(reaction.emoji.name) && user.id === message.author.id;
				};
				const reaction = (await botMessage.awaitReactions(filter, { max: 1, time: 30000 }));
				if (reaction.size === 0) {
					this.client.minigamePlayers.delete(message.author.id);
					msg.edit("You didn't answer in time! Please run the command again to try again.");
					return;
				}
				const lookupMap = {
					"1️⃣": 0,
					"2️⃣": 1,
					"3️⃣": 2,
					"4️⃣": 3,
					"5️⃣": 4,
					"6️⃣": 5,
					"7️⃣": 6,
					"8️⃣": 7,
					"9️⃣": 8,
				};
				const reactionAnswer = lookupMap[reaction.first().emoji.name];
				if (reactionAnswer !== answer) {
					this.client.minigamePlayers.delete(message.author.id);
					this.client.database.removeItem({ itemName: "palette", userID: message.author.id });
					answer = answer + 1;
					msg.edit("That's incorrect, it was " + answer + ". Try again next time!");
					return;
				} else {
					this.client.database.addCandyCanes({ amount: 25, userID: message.author.id });
					this.client.minigamePlayers.delete(message.author.id);
					this.client.database.removeItem({ itemName: "palette", userID: message.author.id });
					msg.edit("That's correct! You got 25 candy canes!");
					return;
				}
			}
		}, 2000);
	}

	async useWatch({ message }) {
		this.client.minigamePlayers.add(message.author.id);
		let timeRed = (Math.floor(Math.random() * 9) + 2) * 1000;
		let seconds = 6;
		let stopMsg = await message.channel.send(`Click the 🛑 reaction as quickly as you can when the box turns green. Starting in ${seconds} seconds`);
		stopMsg.react("🛑");
		const timer = setInterval(async () => {
			seconds = seconds - 2;
			await stopMsg.edit(`Click the 🛑 reaction as quickly as you can when the box turns green. Starting in ${seconds} seconds`);
			if (seconds <= 0) {
				clearInterval(timer);
				await stopMsg.edit("🟥");
				const filter = (reaction, user) => {
					return reaction.emoji.name === "🛑" && user.id === message.author.id;
				};
				const redReaction = (await stopMsg.awaitReactions(filter, { max: 1, time: timeRed }));
				if (redReaction.size === 0) {
					await stopMsg.edit("🟩");
					let startGreen = new Date();
					const greenReaction = (await stopMsg.awaitReactions(filter, { max: 1, time: 8000 }));
					if (greenReaction.size === 0) {
						this.client.minigamePlayers.delete(message.author.id);
						this.client.database.removeItem({ itemName: "watch", userID: message.author.id });
						stopMsg.edit("You were too slow! Click it as soon as it turns green next time.");
						return;
					} else {
						let endGreen = new Date();
						let timeToReact = endGreen.getTime() - startGreen.getTime();
						this.client.minigamePlayers.delete(message.author.id);
						this.client.database.removeItem({ itemName: "watch", userID: message.author.id });
						const toAdd = Math.floor(timeToReact >= 550 ? Math.max(5, 95 - (timeToReact / 10)) :
							timeToReact < 500 ? 60 : 50);
						this.client.database.addCandyCanes({ amount: toAdd, userID: message.author.id });
						stopMsg.edit(`You took ${timeToReact} ms to react, so you got ${toAdd} candy canes!`);
						return;
					}
				} else {
					this.client.minigamePlayers.delete(message.author.id);
					this.client.database.removeItem({ itemName: "watch", userID: message.author.id });
					stopMsg.edit("You were too quick! Wait for it to turn green next time.");
					return;
				}
			}
		}, 2000);
	}

	shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	stringInsert(arr, len) {
		var chunks = [], i = 0, n = arr.length;
		while (i < n) {
			chunks.push(arr.slice(i, i += len));
		}
		return chunks;
	}


}

module.exports = Database;

util.deprecate(Database.prototype.findIfGuildExists, "findIfGuildExists is deprecated, use getGuildDataFromID instead.");
util.deprecate(Database.prototype.checkNewGuild, "checkNewGuild is deprecated, use getGuildDataFromID instead.");
util.deprecate(Database.prototype.checkPresentAmount, "checkPresentAmount is deprecated, use getPresentAmountForGuild.");
util.deprecate(Database.prototype.checkIfPartner, "checkIfPartner is deprecated, use isPartner.");
util.deprecate(Database.prototype.findIfClaimedBy, "findIfClaimedBy is deprecated, use getStaffApprovalFromMessageID.");
