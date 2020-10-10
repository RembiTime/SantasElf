const { Command } = require("discord-akairo");

class DBNewTableCommand extends Command {
	constructor() {
		super("newTable", {
			aliases: ["newTable"],
			description: "Creates a new table",
			// ownerOnly: true,
			args: [{
				id: "name",
				type: "string"
			}]
		});
	}

	async exec(message, { name }) {
		let table1 = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${name}'`;
		this.client.database.query(table1, (err, result) => {
			if (err) throw err;
			console.log(result);
			if (result.length != 0) {
				message.channel.send("This table already exists!");
			}

			else {
				let table1 = `CREATE TABLE ${name}(id int AUTO_INCREMENT, code VARCHAR(255), presentLevel int, timesFound int, serverName VARCHAR(255), serverID decimal(20,0), channelName VARCHAR(255), channelID decimal(20,0), hiddenByName VARCHAR(255), hiddenByID decimal(20,0), PRIMARY KEY(id))`;
				this.client.database.query(table1, (err, result) => {
					if (err) throw err;
					console.log(result);
					message.channel.send("Create a new table called " + "`" + name + "`");
				});
			}
		});
	}
}

module.exports = DBNewTableCommand;
