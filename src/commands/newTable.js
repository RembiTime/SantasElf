const { Command } = require("discord-akairo");

class DBNewTableCommand extends Command {
	constructor() {
		super("newTable", {
			aliases: ["newTable"],
			description: "Creates a new table",
			//ownerOnly: true
		});
	}

	async exec(message) {

		const args = message.content.slice(9).trim().split(" ");

		if (!args.length) {
			return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		}
		let table1 = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${args[0]}'`;
		this.client.database.query(table1, (err, result) => {
			if (err) throw err;
			console.log(result);
			if (result.length != 0) {
				message.channel.send("This table already exists!");
			}

			else {
				let table1 = `CREATE TABLE ${args[0]}(id int AUTO_INCREMENT, code VARCHAR(255), presentLevel int, timesFound int, serverName VARCHAR(255), serverID decimal(20,0), channelName VARCHAR(255), channelID decimal(20,0), hiddenByName VARCHAR(255), hiddenByID decimal(20,0), PRIMARY KEY(id))`;
				this.client.database.query(table1, (err, result) => {
					if (err) throw err;
					console.log(result);
					message.channel.send("Create a new table called " + "`" + args[0] + "`");
				});
			}
		});
	}
}

module.exports = DBNewTableCommand;
