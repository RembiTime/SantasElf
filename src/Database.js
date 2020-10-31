const mysql = require("mysql2");
const items = require("./items");

class Database {
	constructor(client, options) {
		this.client = client;
		this.pool = mysql.createPool({ ...options, supportBigNumbers: true, bigNumberStrings: true }).promise();
	}

	async init() {
		await Promise.all([
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS presents (
					id            INTEGER AUTO_INCREMENT,
					code          VARCHAR(255)     NOT NULL,
					presentLevel  INTEGER          NOT NULL,
					timesFound    INTEGER          NOT NULL,
					guildID       BIGINT UNSIGNED  NOT NULL,
					channelID     BIGINT UNSIGNED  NOT NULL,
					hiddenByID    BIGINT UNSIGNED  NOT NULL,
					PRIMARY KEY(id)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS itemsConfig (
					name  VARCHAR(255),
					rank  TINYINT,
					PRIMARY KEY(name),
					CHECK (rank >= 0 AND rank <= 6)
				)
			`).then(() => this.pool.execute(`
				CREATE TABLE IF NOT EXISTS items (
					name    VARCHAR(255),
					userID  BIGINT UNSIGNED,
					amount  INTEGER,
					record  INTEGER,
					PRIMARY KEY(name, userID),
					FOREIGN KEY (name) REFERENCES itemsConfig(name)
				)
			`)),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS userData (
					userID         BIGINT UNSIGNED,
					userName       VARCHAR(255)  NOT NULL,
					candyCanes     INTEGER       NOT NULL,
					wrongGuesses   INTEGER       NOT NULL,
					firstFinder    INTEGER       NOT NULL,
					totalPresents  INTEGER       NOT NULL,
					lvl1Presents   INTEGER       NOT NULL,
					lvl1Total      INTEGER       NOT NULL,
					lvl2Presents   INTEGER       NOT NULL,
					lvl2Total      INTEGER       NOT NULL,
					lvl3Presents   INTEGER       NOT NULL,
					lvl3Total      INTEGER       NOT NULL,
					lvl4Presents   INTEGER       NOT NULL,
					lvl4Total      INTEGER       NOT NULL,
					lvl5Presents   INTEGER       NOT NULL,
					lvl5Total      INTEGER       NOT NULL,
					PRIMARY KEY(userID)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS foundPresents (
					id           INTEGER AUTO_INCREMENT,
					userID       BIGINT UNSIGNED  NOT NULL,
					userName     VARCHAR(255)     NOT NULL,
					presentCode  VARCHAR(255)     NOT NULL,
					PRIMARY KEY(id)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS staffApproval (
					messageID     BIGINT UNSIGNED,
					status        ENUM('ONGOING', 'ACCEPTED', 'DENIED')  NOT NULL,
					claimedByID   BIGINT UNSIGNED,
					code          VARCHAR(255)     NOT NULL,
					presentLevel  INTEGER          NOT NULL,
					guildID       BIGINT UNSIGNED  NOT NULL,
					channelID     BIGINT UNSIGNED  NOT NULL,
					hiddenByID    BIGINT UNSIGNED  NOT NULL
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS guildData (
					guildID	       BIGINT UNSIGNED  NOT NULL,
					isPartner      BOOLEAN          NOT NULL,
					appealed3Deny  BOOLEAN          NOT NULL
				)
			`)
		]);

		await Promise.all(items.map(item => (
			this.pool.execute("INSERT IGNORE INTO itemsConfig (name, rank) VALUES (?, ?)", [item.id, item.rank])
		)));
	}

	async getPresent(options) {
		if ("id" in options) {
			const [results] = await this.pool.execute("SELECT * FROM presents WHERE id = ?", [options.id]);
			return results.length ? results[0] : null;
		} else if ("code" in options && "guildID" in options) {
			// TODO: Handle multiple presents with same code at different times in one guild?
			const [results] = await this.pool.execute("SELECT * FROM presents WHERE code = ? AND guildID = ?", [options.code, options.guildID]);
			return results.length ? results[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkNewGuild({ guildID }) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM guildData WHERE guildID = ?", [guildID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async checkIfPartner({ guildID }) {
		//yes, it's the exact same as above but with a different name :<
		const [results] = await this.pool.execute("SELECT * FROM guildData WHERE guildID = ?", [guildID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async checkStaffApprovalIDs(options) {
		if ("messageID" in options) {
			//Check if message is stored
			const [newGuild] = await this.pool.execute("SELECT * FROM staffApproval WHERE messageID = ?", [options.messageID]);
			return newGuild.length ? newGuild[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkApprovalIfOngoing(options) {
		if ("messageID" in options) {
			//Check if message is stored
			const [newGuild] = await this.pool.execute("SELECT * FROM staffApproval WHERE messageID = ? AND status = 'ONGOING'", [options.messageID]);
			return newGuild.length ? newGuild[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkOngoingIfCodeDupe(options) {
		if ("code" in options) {
			//Check if message is stored
			const [newGuild] = await this.pool.execute("SELECT * FROM staffApproval WHERE code = ? AND status = 'ONGOING'", [options.code]);
			return newGuild.length ? newGuild[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async findIfDupe(options) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM foundPresents WHERE userID = ? AND presentCode = ?", [options.userID, options.presentCode]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async userDataCheck(options) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM userData WHERE userID = ?", [options.userID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async userHasItem({userID, itemName}) {
		const [results] = await this.pool.execute("SELECT 1 FROM items WHERE name = ? AND userID = ?", [itemName, userID]);
		return !!results.length;
	}

	async itemCheck({userID, itemName}) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM items WHERE name = ? AND userID = ?", [itemName, userID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async findIfClaimedBy({ messageID }) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM staffApproval WHERE messageID = ?", [messageID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async findIfGuildExists({ guildID }) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM guildData WHERE guildID = ?", [guildID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async getAllItems({ userID }) {
		const [results] = await this.pool.execute("SELECT * FROM items WHERE userID = ?", [userID]);
		return results.map(({ name, amount, record }) => ({
			item: items.find(e => e.id === name),
			amount,
			record
		}));
	}

	async addPresent({ code, presentLevel, timesFound, guildID, channelID, hiddenByID }) {
		await this.pool.execute(`
			INSERT INTO presents SET
				code = ?,
				presentLevel = ?,
				timesFound = ?,
				guildID = ?,
				channelID = ?,
				hiddenByID = ?
			`, [code, presentLevel, timesFound, guildID, channelID, hiddenByID]);
	}

	async presentFound({ userID, userName, presentCode }) {
		await this.pool.execute(`
			INSERT INTO foundPresents SET
				userID = ?,
				userName = ?,
				presentCode = ?
			`, [userID, userName, presentCode]);
	}

	async addNewUser({ userID, userName }) {
		await this.pool.execute(`
			INSERT INTO userData SET
				userID = ?,
				userName = ?,
				candyCanes = 0,
				wrongGuesses = 0,
				firstFinder = 0,
				totalPresents = 0,
				lvl1Presents = 0,
				lvl1Total = 0,
				lvl2Presents = 0,
				lvl2Total = 0,
				lvl3Presents = 0,
				lvl3Total = 0,
				lvl4Presents = 0,
				lvl4Total = 0,
				lvl5Presents = 0,
				lvl5Total = 0
			`, [userID, userName]);
	}

	async addStaffApprovalID({ messageID, status, code, presentLevel, guildID, channelID, hiddenByID }) {
		await this.pool.execute(`
			INSERT INTO staffApproval SET
				messageID = ?,
				status = ?,
				code = ?,
				presentLevel = ?,
				guildID = ?,
				channelID = ?,
				hiddenByID = ?
			`, [messageID, status, code, presentLevel, guildID, channelID, hiddenByID]);
	}

	async addNewGuild({ guildID, trueFalse }) {
		await this.pool.execute(`
			INSERT INTO guildData SET
				guildID = ?,
				isPartner = ?,
				appealed3Deny = FALSE
			`, [guildID, trueFalse]);
	}

	async notClaimed({ messageID }) {
		await this.pool.execute("UPDATE staffApproval SET claimedByID = NULL WHERE messageID = ?", [messageID]);
	}

	async claimedUpdate({ userID, messageID }) {
		await this.pool.execute("UPDATE staffApproval SET claimedByID = ? WHERE messageID = ?", [userID, messageID]);
	}

	async approvalStatusUpdate({ status, messageID }) {
		await this.pool.execute("UPDATE staffApproval SET status = ? WHERE messageID = ?", [status, messageID]);
	}

	async addPartner({ guildID }) {
		await this.pool.execute("UPDATE guildData SET isPartner = TRUE WHERE guildID = ?", [guildID]);
	}

	async changeLevel({ presentLevel, messageID }) {
		await this.pool.execute("UPDATE staffApproval SET presentLevel = ? WHERE messageID = ?", [presentLevel, messageID]);
	}

	async appealAccept({ guildID }) {
		await this.pool.execute("UPDATE guildData SET appealed3Deny = TRUE WHERE guildID = ?", [guildID]);
	}

	async addUserPresent({ presentLevel, userID }) {
		let presentAmt = "lvl" + presentLevel + "Presents";
		let presentTotal = "lvl" + presentLevel + "Total";
		await this.pool.execute(`UPDATE userData SET ${presentAmt} = ${presentAmt} + 1 WHERE userID = ?`, [userID]);
		await this.pool.execute(`UPDATE userData SET ${presentTotal} = ${presentTotal} + 1 WHERE userID = ?`, [userID]);
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
		const [[result]] = await this.pool.execute("SELECT SUM(wrongGuesses) FROM userData");
		return result;
	}

	async getGlobalUsersWithPresents() {
		const [[result]] = await this.pool.execute("SELECT COUNT(DISTINCT userID) FROM foundPresents");
		return result;
	}

	async getGlobalGuildsWithPresents() {
		const [[result]] = await this.pool.execute("SELECT COUNT(DISTINCT guildID) FROM presents");
		return result;
	}

	async getGlobalPresentsFound() {
		const [[result]] = await this.pool.execute("SELECT COUNT(DISTINCT presentCode) FROM foundPresents");
		return result;
	}

	async checkGuildDeniedAmount({ guildID }) {
		const [[result]] = await this.pool.execute("SELECT COUNT(*) AS count FROM staffApproval WHERE status = 'DENIED' AND guildID = ?", [guildID]);
		return result;
	}

	async checkIfPendingPresent({ guildID }) {
		const [[result]] = await this.pool.execute("SELECT COUNT(*) AS count FROM staffApproval WHERE status = 'ONGOING' AND guildID = ?", [guildID]);
		return result;
	}

	async checkPresentAmount({ guildID }) {
		const [[result]] = await this.pool.execute("SELECT COUNT(*) AS count FROM presents WHERE guildID = ?", [guildID]);
		return result;
	}

	//ITEM STUFF

	async addCandyCanes({ amount, userID }) {
		await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + ? WHERE userID = ?", [amount, userID]);
	}

	async addItem({ itemName, userID, presentLevel }) {
		presentLevel = "lvl" + presentLevel + "Presents";
		await this.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, [itemName, userID]);
		await this.pool.execute(`UPDATE userData SET ${presentLevel} = ${presentLevel} - 1 WHERE userID = ?`, [userID]);
	}

	async removeItem({ itemName, userID }) {
		await this.pool.execute("UPDATE items SET amount = amount - 1 WHERE name = ? AND userID = ?", [itemName, userID]);
	}

	async removePresent({ userData, presentLevel }) {
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

	async agivePresent({ message, userID, presentLevel, amount}) {
		if (presentLevel == 1) {
			await this.pool.execute(`UPDATE userData SET lvl1Presents = lvl1Presents + ${amount} WHERE userID = ?`, [userID]);
			message.channel.send("Added " + amount + " level 1 present(s)");
		} else if (presentLevel == 2) {
			await this.pool.execute(`UPDATE userData SET lvl2Presents = lvl2Presents + ${amount} WHERE userID = ?`, [userID]);
			message.channel.send("Added " + amount + " level 2 present(s)");
		} else if (presentLevel == 3) {
			await this.pool.execute(`UPDATE userData SET lvl3Presents = lvl3Presents + ${amount} WHERE userID = ?`, [userID]);
			message.channel.send("Added " + amount + " level 3 present(s)");
		} else if (presentLevel == 4) {
			await this.pool.execute(`UPDATE userData SET lvl4Presents = lvl4Presents + ${amount} WHERE userID = ?`, [userID]);
			message.channel.send("Added " + amount + " level 4 present(s)");
		} else if (presentLevel == 5) {
			await this.pool.execute(`UPDATE userData SET lvl5Presents = lvl5Presents + ${amount} WHERE userID = ?`, [userID]);
			message.channel.send("Added " + amount + " level 5 present(s)");
		}
	}

	async checkBigTriangle({ userID, message }) {
		// this doesn't work yet
		if (process.env.TOKEN) { return false; }

		const { result } = await this.pool.execute(`
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

		if (result) {
			await message.channel.send("**What is happening? Your 3 mysterious parts, and fractal move together to form a weird looking 3D triangle shape. Once they are in position, the cyber dragon figurine awakens and upon seeing the parts, uses the slime and the spanner to secure the pieces into place. The object starts to glow and then floats up into the air. Congratulations, you've made the legendary Big Triangle!**");
		}
	}

	generateRarity({ presentLevel }) {
		// Rows are weights for present ranks for different present levels
		const weights = [
			[10, 45, 25, 15,  4,  1],
			[10, 35, 25, 20,  8,  2],
			[10, 25, 25, 25, 12,  3],
			[10, 15, 20, 30, 20,  5],
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
			this.pool.execute(`UPDATE userData SET ${lvlPresents} = ${lvlPresents} - 1 WHERE userID = ?`, [userID]);
		}

		if (typeof item.onFind === "function") {
			await item.onFind(this.client, message);
		}

		if (item.response) {
			await message.channel.send(item.response);
		}
	}

	async useMistletoe({message}) {
		let kissMessage = await message.channel.send("Who would you like to kiss?");
		const filter = m => m.author.id === message.author.id;
		const mentionMsg = (await message.channel.awaitMessages(filter, { max: 1, time: 120000, errors: ["time"] })).first();
		if (mentionMsg.mentions.users.size === 1) {
			let kissedID = mentionMsg.mentions.users.first().id;
			if (kissedID === message.author.id) {
				message.channel.send("You can't kiss yourself!");
				return;
			}
			message.delete();
			kissMessage.delete();
			await mentionMsg.delete();
			message.channel.send("<@" + message.author.id + "> kissed <@" + kissedID + ">! Congrats! (You both get 15 candy canes!)");
			await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + ? WHERE userID = ?", [15, message.author.id]);
			await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + ? WHERE userID = ?", [15, kissedID]);
			await this.pool.execute("UPDATE items SET amount = amount - 1 WHERE name = ? AND userID = ?", ["mistletoe", message.author.id]);
			return;
		} if (mentionMsg.mentions.users.size > 1) {
			message.channel.send("Please only mention one user!");
			return;
		} if (mentionMsg.mentions.users.size === 0) {
			message.channel.send("Please mention someone to kiss!");
		}
	}

	async useMeme({message}) {
		let candyCaneAmt = Math.floor(Math.random() * 41) - 10;
		await this.pool.execute("UPDATE items SET amount = amount - 1 WHERE name = ? AND userID = ?", ["meme", message.author.id]);
		if (candyCaneAmt === 0) {
			message.channel.send("Well, looks like your meme got lost in new and nobody saw it.");
			return;
		} if (candyCaneAmt < 0) {
			let positiveNum = Math.abs(candyCaneAmt);
			message.channel.send("Wow, people did not like your meme! You lost " + positiveNum + " candy canes! Welcome to controversial.");
			await this.pool.execute("UPDATE userData SET candyCanes = candyCanes - ? WHERE userID = ?", [positiveNum, message.author.id]);
			return;
		} if (candyCaneAmt > 0 && candyCaneAmt <= 15) {
			message.channel.send("People liked your meme, which made it to hot! You gained " + candyCaneAmt + " candy canes!");
			await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + ? WHERE userID = ?", [candyCaneAmt, message.author.id]);
			return;
		} if (candyCaneAmt > 15) {
			message.channel.send("People loved your meme, which made it to the top posts! You gained " + candyCaneAmt + " candy canes!");
			await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + ? WHERE userID = ?", [candyCaneAmt, message.author.id]);
			return;
		}
	}


}

module.exports = Database;
