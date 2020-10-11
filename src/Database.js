const mysql = require("mysql2");

class Database {
	constructor(options) {
		this.pool = mysql.createPool(options).promise();
	}

	async init() {
		await Promise.all([
			this.pool.execute("CREATE TABLE IF NOT EXISTS presents (id int AUTO_INCREMENT, code VARCHAR(255), presentLevel int, timesFound int, serverName VARCHAR(255), serverID decimal(20,0), channelName VARCHAR(255), channelID decimal(20,0), hiddenByName VARCHAR(255), hiddenByID decimal(20,0), PRIMARY KEY(id))"),
			this.pool.execute("CREATE TABLE IF NOT EXISTS userData (userID decimal(20,0), totalPresents int, lvl1Presents int, lvl2Presents int, lvl3Presents int, item1 int, item2 int, item3 int, PRIMARY KEY(userID))"),
			this.pool.execute("CREATE TABLE IF NOT EXISTS foundPresents (id int AUTO_INCREMENT, userID decimal(20,0), presentCode VARCHAR(255), PRIMARY KEY(id))")
		]);
	}

	async getPresent(options) {
		if ("id" in options) {
			const [results] = await this.pool.execute("SELECT * FROM presents WHERE id = ?", [options.id]);
			return results.length ? results[0] : null;
		} else if ("code" in options && "serverID" in options) {
			// TODO: Handle multiple presents with same code at different times in one guild?
			const [results] = await this.pool.execute("SELECT * FROM presents WHERE code = ? AND serverID = ?", [options.code, options.serverID]);
			return results.length ? results[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkNewServer(options) {
		if ("id" in options) {
			const [results] = await this.pool.execute("SELECT * FROM presents WHERE id = ?", [options.id]);
			return results.length ? results[0] : null;
		} else if ("code" in options && "serverID" in options) {
			//Check if server is new
			const [newServer] = await this.pool.execute("SELECT * FROM presents WHERE serverID = ?", [options.serverID]);
			return newServer.length ? newServer[0] : null;
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

	async getGlobalStats() {
		//if ("id" in options) {
			const [results] = await this.pool.execute("SELECT * FROM globalStats WHERE id = 'a'");
			return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async addPresent({ code, presentLevel, timesFound, serverName, serverID, channelName, channelID, hiddenByName, hiddenByID }) {
		await this.pool.execute(`
			INSERT INTO presents SET
				code = ?,
				presentLevel = ?,
				timesFound = ?,
				serverName = ?,
				serverID = ?,
				channelName = ?,
				channelID = ?,
				hiddenByName = ?,
				hiddenByID = ?
			`, [code, presentLevel, timesFound, serverName, serverID, channelName, channelID, hiddenByName, hiddenByID]);
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

	/* Used to create global stats -- Uneeded
	async startGlobalStats({ id }) {
		await this.pool.execute(`
			INSERT INTO globalStats SET
				id = ?,
				wrongGuesses = 0,
				usersWithPresents = 0,
				guildsWithPresents = 0,
				presentsFound = 0
			`, [id]);
	}*/

	async incrementPresentFindCount(id) {
		await this.pool.execute("UPDATE presents SET timesFound = timesFound + 1 WHERE id = ?", [id]);
	}

	async incrementUserWrongGuesses(userID) {
		await this.pool.execute("UPDATE userData SET wrongGuesses = wrongGuesses + 1 WHERE userID = ?", [userID]);
	}

	async incrementGlobalWrongGuesses() {
		await this.pool.execute("UPDATE globalStats SET wrongGuesses = wrongGuesses + 1 WHERE id = 'a'");
	}

	async incrementUserFirstFinder(userID) {
		await this.pool.execute("UPDATE userData SET firstFinder = firstFinder + 1 WHERE userID = ?", [userID]);
	}

	async incrementUserTotalPresents(userID) {
		await this.pool.execute("UPDATE userData SET totalPresents = totalPresents + 1 WHERE userID = ?", [userID]);
	}

	async incrementGlobalUsersWithPresents() {
		await this.pool.execute("UPDATE globalStats SET usersWithPresents = usersWithPresents + 1 WHERE id = 'a'");
	}

//TODO:
	async incrementGlobalGuildsWithPresents() {
		await this.pool.execute("UPDATE globalStats SET guildsWithPresents = guildsWithPresents + 1 WHERE id = 'a'");
	}

	async incrementGlobalPresentsFound() {
		await this.pool.execute("UPDATE globalStats SET presentsFound = presentsFound + 1 WHERE id = 'a'");
	}

}

module.exports = Database;
