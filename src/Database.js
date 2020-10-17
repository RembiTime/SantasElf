const mysql = require("mysql2");

class Database {
	constructor(options) {
		this.pool = mysql.createPool({ ...options, supportBigNumbers: true, bigNumberStrings: true }).promise();
	}

	async init() {
		await Promise.all([
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS presents (
					id            INTEGER AUTO_INCREMENT,
					code          VARCHAR(255),
					presentLevel  INTEGER,
					timesFound    INTEGER,
					guildName     VARCHAR(255),
					guildID       BIGINT UNSIGNED,
					channelName   VARCHAR(255),
					channelID     BIGINT UNSIGNED,
					hiddenByName  VARCHAR(255),
					hiddenByID    BIGINT UNSIGNED,
					PRIMARY KEY(id)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS userData (
					userID         BIGINT UNSIGNED,
					userName       VARCHAR(255),
					wrongGuesses   INTEGER,
					firstFinder    INTEGER,
					totalPresents  INTEGER,
					lvl1Presents   INTEGER,
					lvl1Total      INTEGER,
					lvl2Presents   INTEGER,
					lvl2Total      INTEGER,
					lvl3Presents   INTEGER,
					lvl3Total      INTEGER,
					item1          INTEGER,
					item2          INTEGER,
					item3          INTEGER,
					PRIMARY KEY(userID)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS foundPresents (
					id           INTEGER AUTO_INCREMENT,
					userID       BIGINT UNSIGNED,
					userName     VARCHAR(255),
					presentCode  VARCHAR(255),
					PRIMARY KEY(id)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS staffApproval (
					messageID     BIGINT UNSIGNED,
					status        ENUM('ONGOING', 'ACCEPTED', 'DENIED'),
					claimedByID   BIGINT UNSIGNED,
					code          VARCHAR(255),
					presentLevel  INTEGER,
					guildName     VARCHAR(255),
					guildID       BIGINT UNSIGNED,
					channelName   VARCHAR(255),
					channelID     BIGINT UNSIGNED,
					hiddenByName  VARCHAR(255),
					hiddenByID    BIGINT UNSIGNED
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

	async checkNewGuild(options) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM foundPresents WHERE userID = ? AND presentCode = ?", [options.userID, options.presentCode]);
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

	async findIfDupe(options) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM foundPresents WHERE userID = ? AND presentCode = ?", [options.userID, options.presentCode]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async findIfFirstPresent(options) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM userData WHERE userID = ?", [options.userID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async findIfClaimedBy({messageID}) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM staffApproval WHERE messageID = ?", [messageID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async addPresent({ code, presentLevel, timesFound, guildName, guildID, channelName, channelID, hiddenByName, hiddenByID }) {
		await this.pool.execute(`
			INSERT INTO presents SET
				code = ?,
				presentLevel = ?,
				timesFound = ?,
				guildName = ?,
				guildID = ?,
				channelName = ?,
				channelID = ?,
				hiddenByName = ?,
				hiddenByID = ?
			`, [code, presentLevel, timesFound, guildName, guildID, channelName, channelID, hiddenByName, hiddenByID]);
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
				wrongGuesses = 0,
				firstFinder = 0,
				totalPresents = 0,
				lvl1Presents = 0,
				lvl2Presents = 0,
				lvl3Presents = 0,
				item1 = 0,
				item2 = 0,
				item3 = 0
			`, [userID, userName]);
	}

	async addStaffApprovalID({ messageID, status, code, presentLevel, guildName, guildID, channelName, channelID, hiddenByName, hiddenByID }) {
		await this.pool.execute(`
			INSERT INTO staffApproval SET
				messageID = ?,
				status = ?,
				code = ?,
				presentLevel = ?,
				guildName = ?,
				guildID = ?,
				channelName = ?,
				channelID = ?,
				hiddenByName = ?,
				hiddenByID = ?
			`, [messageID, status, code, presentLevel, guildName, guildID, channelName, channelID, hiddenByName, hiddenByID]);
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
}

module.exports = Database;
