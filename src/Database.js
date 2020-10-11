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

	async incrementPresentFindCount(id) {
		await this.pool.execute("UPDATE presents SET timesFound = timesFound + 1 WHERE id = ?", [id]);
	}
}

module.exports = Database;
