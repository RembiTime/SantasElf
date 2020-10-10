const { Command } = require("discord-akairo");

class FoundCommand extends Command {
	constructor() {
		super("found", {
			aliases: ["found"],
			description: "Command to be used when you find a present",
			args: [{
				id: "presentName",
				type: "string"
			}]
		});
	}

	async exec(message, { presentName }) {
		this.client.database.query(`SELECT * FROM presents WHERE code = "${presentName}"`, (err, result) => {
			if (err) throw err;
			if (result.length == 0) {
				message.channel.send("That present does not exist!");
			} else {
				this.client.database.query(`SELECT presentLevel, timesFound FROM presents WHERE code = '${presentName}'`, (err, result) => {
					if (err) throw err;
					console.log(result);
				});

				if (result[0].timesFound == 0) {
					let timesFound = result[0].timesFound;
					timesFound = timesFound + 1;
					this.client.database.query(`UPDATE presents SET timesFound = ${timesFound} WHERE code = '${presentName}'`, (err, result) => {
						if (err) throw err;
						console.log(result);
					});
					message.channel.send("You were the first one to find this present! It had a difficulty of `" + result[0].presentLevel + "`.");
				} else {
					let timesFound = result[0].timesFound;
					timesFound = timesFound + 1;
					this.client.database.query(`UPDATE presents SET timesFound = ${timesFound} WHERE code = '${presentName}'`, (err, result) => {
						if (err) throw err;
						console.log(result);
					});
					message.channel.send("You just claimed the present! It had a difficulty of `" + result[0].presentLevel + "`.");
				}
			}
		}
		);
	}
}

module.exports = FoundCommand;
