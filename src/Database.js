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
					coalAmt        INTEGER       NOT NULL,
					coalTotal      INTEGER       NOT NULL,
					treeAmt        INTEGER       NOT NULL,
					treeTotal      INTEGER       NOT NULL,
					paletteAmt     INTEGER       NOT NULL,
					paletteTotal   INTEGER       NOT NULL,
					ornamentAmt    INTEGER       NOT NULL,
					ornamentTotal  INTEGER       NOT NULL,
					hatAmt         INTEGER       NOT NULL,
					hatTotal       INTEGER       NOT NULL,
					mistletoeAmt   INTEGER       NOT NULL,
					mistletoeTotal INTEGER       NOT NULL,
					watchAmt       INTEGER       NOT NULL,
					watchTotal     INTEGER       NOT NULL,
					giftcardAmt    INTEGER       NOT NULL,
					giftcardTotal  INTEGER       NOT NULL,
					consoleAmt     INTEGER       NOT NULL,
					consoleTotal   INTEGER       NOT NULL,
					computerAmt    INTEGER       NOT NULL,
					computerTotal  INTEGER       NOT NULL,
					plushAmt       INTEGER       NOT NULL,
					plushTotal     INTEGER       NOT NULL,
					figurineAmt    INTEGER       NOT NULL,
					figurineTotal  INTEGER       NOT NULL,
					socksAmt       INTEGER       NOT NULL,
					socksTotal     INTEGER       NOT NULL,
					duckAmt        INTEGER       NOT NULL,
					duckTotal      INTEGER       NOT NULL,
					carAmt         INTEGER       NOT NULL,
					carTotal       INTEGER       NOT NULL,
					ownershipAmt   INTEGER       NOT NULL,
					ownershipTotal INTEGER       NOT NULL,
					memeAmt        INTEGER       NOT NULL,
					memeTotal      INTEGER       NOT NULL,
					glitchTotal    INTEGER       NOT NULL,
					pencilsAmt     INTEGER       NOT NULL,
					pencilsTotal   INTEGER       NOT NULL,
					snowglobeAmt   INTEGER       NOT NULL,
					snowglobeTotal INTEGER       NOT NULL,
					boxAmt         INTEGER       NOT NULL,
					boxTotal       INTEGER       NOT NULL,
					gooseTotal     INTEGER       NOT NULL,
					dragonEggAmt   INTEGER       NOT NULL,
					dragonEggTotal INTEGER       NOT NULL,
					mysteriousPart INTEGER       NOT NULL,
					roleTotal      INTEGER       NOT NULL,
					spannerAmt     INTEGER       NOT NULL,
					spannerTotal   INTEGER       NOT NULL,
					pumpkinAmt     INTEGER       NOT NULL,
					pumpkinTotal   INTEGER       NOT NULL,
					pinAmt         INTEGER       NOT NULL,
					pinTotal       INTEGER       NOT NULL,
					orangeAmt      INTEGER       NOT NULL,
					orangeTotal    INTEGER       NOT NULL,
					slimeAmt       INTEGER       NOT NULL,
					slimeTotal     INTEGER       NOT NULL,
					dirtAmt        INTEGER       NOT NULL,
					dirtTotal      INTEGER       NOT NULL,
					puppyAmt       INTEGER       NOT NULL,
					puppyTotal     INTEGER       NOT NULL,
					blanketAmt     INTEGER       NOT NULL,
					blanketTotal   INTEGER       NOT NULL,
					shirtAmt       INTEGER       NOT NULL,
					shirtTotal     INTEGER       NOT NULL,
					swordAmt       INTEGER       NOT NULL,
					swordTotal     INTEGER       NOT NULL,
					chocolateAmt   INTEGER       NOT NULL,
					chocolateTotal INTEGER       NOT NULL,
					cyberDragonAmt INTEGER       NOT NULL,
					cyberDragonTotal INTEGER     NOT NULL,
					headphonesAmt  INTEGER       NOT NULL,
					headphonesTotal INTEGER      NOT NULL,
					gameAmt        INTEGER       NOT NULL,
					gameTotal      INTEGER       NOT NULL,
					footballAmt    INTEGER       NOT NULL,
					footballTotal  INTEGER       NOT NULL,
					football2Amt   INTEGER       NOT NULL,
					football2Total INTEGER       NOT NULL,
					keyboardTotal  INTEGER       NOT NULL,
					cornAmt        INTEGER       NOT NULL,
					cornTotal      INTEGER       NOT NULL,
					simpTotal      INTEGER       NOT NULL,
					dupeAmt        INTEGER       NOT NULL,
					dupeTotal      INTEGER       NOT NULL,
					discAmt        INTEGER       NOT NULL,
					discTotal      INTEGER       NOT NULL,
					fractalAmt     INTEGER       NOT NULL,
					fractalTotal   INTEGER       NOT NULL,
					bigTriangleAmt INTEGER       NOT NULL,
					bigTriangleTotal INTEGER     NOT NULL,
					catAmt         INTEGER       NOT NULL,
					catTotal       INTEGER       NOT NULL,
					brokenPlaneAmt INTEGER       NOT NULL,
					brokenPlaneTotal INTEGER     NOT NULL,
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
				lvl5Total = 0,
				coalAmt = 0,
				coalTotal = 0,
				treeAmt = 0,
				treeTotal = 0,
				paletteAmt = 0,
				paletteTotal = 0,
				ornamentAmt = 0,
				ornamentTotal = 0,
				hatAmt = 0,
				hatTotal = 0,
				mistletoeAmt   = 0,
				mistletoeTotal = 0,
				watchAmt       = 0,
				watchTotal     = 0,
				giftcardAmt    = 0,
				giftcardTotal  = 0,
				consoleAmt     = 0,
				consoleTotal   = 0,
				computerAmt    = 0,
				computerTotal  = 0,
				plushAmt       = 0,
				plushTotal     = 0,
				figurineAmt    = 0,
				figurineTotal  = 0,
				socksAmt       = 0,
				socksTotal     = 0,
				duckAmt        = 0,
				duckTotal      = 0,
				carAmt         = 0,
				carTotal       = 0,
				ownershipAmt   = 0,
				ownershipTotal = 0,
				memeAmt        = 0,
				memeTotal      = 0,
				glitchTotal    = 0,
				pencilsAmt     = 0,
				pencilsTotal   = 0,
				snowglobeAmt   = 0,
				snowglobeTotal = 0,
				boxAmt         = 0,
				boxTotal       = 0,
				gooseTotal     = 0,
				dragonEggAmt   = 0,
				dragonEggTotal = 0,
				mysteriousPart = 0,
				roleTotal      = 0,
				spannerAmt     = 0,
				spannerTotal   = 0,
				pumpkinAmt     = 0,
				pumpkinTotal   = 0,
				pinAmt         = 0,
				pinTotal       = 0,
				orangeAmt      = 0,
				orangeTotal    = 0,
				slimeAmt       = 0,
				slimeTotal     = 0,
				dirtAmt        = 0,
				dirtTotal      = 0,
				puppyAmt       = 0,
				puppyTotal     = 0,
				blanketAmt     = 0,
				blanketTotal   = 0,
				shirtAmt       = 0,
				shirtTotal     = 0,
				swordAmt       = 0,
				swordTotal     = 0,
				chocolateAmt   = 0,
				chocolateTotal = 0,
				cyberDragonAmt = 0,
				cyberDragonTotal = 0,
				headphonesAmt  = 0,
				headphonesTotal = 0,
				gameAmt        = 0,
				gameTotal      = 0,
				footballAmt    = 0,
				footballTotal  = 0,
				football2Amt   = 0,
				football2Total = 0,
				keyboardTotal  = 0,
				cornAmt        = 0,
				cornTotal      = 0,
				simpTotal      = 0,
				dupeAmt        = 0,
				dupeTotal      = 0,
				discAmt        = 0,
				discTotal      = 0,
				fractalAmt     = 0,
				fractalTotal   = 0,
				bigTriangleAmt = 0,
				bigTriangleTotal = 0,
				catAmt         = 0,
				catTotal       = 0,
				brokenPlaneAmt = 0,
				brokenPlaneTotal = 0
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
		let itemNameAmt = itemName + "Amt";
		let itemNameTotal = itemName + "Total";
		presentLevel = "lvl" + presentLevel + "Presents";
		await this.pool.execute(`UPDATE userData SET ${itemNameAmt} = ${itemNameAmt} + 1 WHERE userID = ?`, [userID]);
		await this.pool.execute(`UPDATE userData SET ${itemNameTotal} = ${itemNameTotal} + 1 WHERE userID = ?`, [userID]);
		await this.pool.execute(`UPDATE userData SET ${presentLevel} = ${presentLevel} - 1 WHERE userID = ?`, [userID]);
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

			SELECT (mysteriousPartAmt, fractalAmt, spannerAmt, slimeAmt, cyberDragonAmt)
				INTO (parts, fractals, spanners, slimes, dragons)
				FROM userData WHERE userID = ?
				FOR UPDATE;

			IF (parts >= 3 AND fractals >= 1 AND spanners >= 1 AND slimes >= 1 AND dragons >= 1) THEN
				UPDATE userData SET
					mysteriousPartAmt = mysteriousPartAmt - 3,
					fractalAmt = fractalAmt - 1,
					spannerAmt = spannerAmt - 1,
					slimeAmt = slimeAmt - 1,
					cyberDragonAmt = cyberDragonAmt - 1
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

		console.log(presentRarity);
		if (item.defaultBehavior !== false) {
			await this.addItem({ itemName: item.id, userID, presentLevel });
		}

		if (typeof item.onFind === "function") {
			await item.onFind(this.client, message);
		}

		if (item.response) {
			await message.channel.send(item.response);
		}
	}
}

module.exports = Database;
