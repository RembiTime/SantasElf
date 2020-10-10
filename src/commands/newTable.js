const { Command } = require("discord-akairo");

let mysql = require("mysql");
let connection = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	port: parseInt(process.env.MYSQL_PORT),
	user: process.env.MYSQL_USERNAME,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE
});

connection.connect(function (err) {
	if (err) throw err;
	console.log("MySQL connected as id " + connection.threadId);
});

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
		connection.query(table1, (err, result) => {
			if (err) throw err;
			console.log(result);
			if (result.length != 0) {
				message.channel.send("This table already exists!");
			}

			else {
				let table1 = `CREATE TABLE ${args[0]}(id int AUTO_INCREMENT, code VARCHAR(255), presentLevel int, timesFound int, serverName VARCHAR(255), serverID decimal(20,0), channelName VARCHAR(255), channelID decimal(20,0), hiddenByName VARCHAR(255), hiddenByID decimal(20,0), PRIMARY KEY(id))`;
				connection.query(table1, (err, result) => {
					if (err) throw err;
					console.log(result);
					message.channel.send("Create a new table called " + "`" + args[0] + "`");
				});
			}
		});
	}
}

module.exports = DBNewTableCommand;
