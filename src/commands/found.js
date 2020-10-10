const { Command } = require("discord-akairo");

let mysql = require("mysql");
let connection = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	port: parseInt(process.env.MYSQL_PORT),
	user: process.env.MYSQL_USERNAME,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE
});

class FoundCommand extends Command {
	constructor() {
		super("found", {
			aliases: ["found"],
			description: "Command to be used when you find a present"
		});
	}

	async exec(message) {
		const args = message.content.slice(6).trim().split(" ");
		/*const command = args.shift().toLowerCase();
    if (!args.length) {
        return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
    }
    else {*/
		let query = connection.query(`SELECT * FROM presents WHERE code = "${args[0]}"`, (err, result) => {
			if (err) throw err;
			if (result.length == 0) {
				message.channel.send("That present does not exist!");
			} else {
				let query = connection.query(`SELECT presentLevel, timesFound FROM presents WHERE code = '${args[0]}'`, (err, result) => {
					if (err) throw err;
					console.log(result);
				});

        if (result[0].timesFound == 0) {
          let timesFound = result[0].timesFound
          timesFound = timesFound + 1
          let query = connection.query(`UPDATE presents SET timesFound = ${timesFound} WHERE code = '${args[0]}'`, (err, result) => {
	           if(err) throw err;
	           console.log(result);
            })
          message.channel.send("You were the first one to find this present! It had a difficulty of `" + result[0].presentLevel + "`.")
        } else {
          let timesFound = result[0].timesFound
          timesFound = timesFound + 1
          let query = connection.query(`UPDATE presents SET timesFound = ${timesFound} WHERE code = '${args[0]}'`, (err, result) => {
             if(err) throw err;
             console.log(result);
            })
				message.channel.send("You just claimed the present! It had a difficulty of `" + result[0].presentLevel + "`.");
      }
		}
  }
		);
	}
}

module.exports = FoundCommand;
