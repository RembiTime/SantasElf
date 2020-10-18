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
					coalTotal			 INTEGER       NOT NULL,
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
					glitchAmt      INTEGER       NOT NULL,
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
					roleAmt        INTEGER       NOT NULL,
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
					keyboardAmt    INTEGER       NOT NULL,
					keyboardTotal  INTEGER       NOT NULL,
					cornAmt        INTEGER       NOT NULL,
					cornTotal      INTEGER       NOT NULL,
					simpAmt				 INTEGER       NOT NULL,
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
