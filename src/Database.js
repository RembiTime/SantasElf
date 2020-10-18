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
					wrongGuesses   INTEGER       NOT NULL,
					firstFinder    INTEGER       NOT NULL,
					totalPresents  INTEGER       NOT NULL,
					lvl1Presents   INTEGER       NOT NULL,
					lvl1Total      INTEGER       NOT NULL,
					lvl2Presents   INTEGER       NOT NULL,
					lvl2Total      INTEGER       NOT NULL,
					lvl3Presents   INTEGER       NOT NULL,
					lvl3Total      INTEGER       NOT NULL,
					item1          INTEGER       NOT NULL,
					item2          INTEGER       NOT NULL,
					item3          INTEGER       NOT NULL,
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
					guildID				BIGINT UNSIGNED  NOT NULL,
					isPartner     ENUM('TRUE', 'FALSE')  NOT NULL,
					appealed3Deny	ENUM('TRUE', 'FALSE')  NOT NULL
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

	async checkNewGuild({guildID}) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM guildData WHERE guildID = ?", [guildID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async checkIfPartner({guildID}) {
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

	async findIfGuildExists({guildID}) {
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
				appealed3Deny = 'FALSE'
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
		await this.pool.execute("UPDATE guildData SET isPartner = 'TRUE' WHERE guildID = ?", [guildID]);
	}

	async changeLevel({ presentLevel, messageID }) {
		await this.pool.execute("UPDATE staffApproval SET presentLevel = ? WHERE messageID = ?", [presentLevel, messageID]);
	}

	async appealAccept({ guildID }) {
		await this.pool.execute("UPDATE guildData SET appealed3Deny = 'TRUE' WHERE guildID = ?", [guildID]);
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
}

module.exports = Database;
