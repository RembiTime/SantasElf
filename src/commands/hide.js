const { Command } = require("discord-akairo");

let mysql      = require("mysql");
let connection = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	port: parseInt(process.env.MYSQL_PORT),
	user: process.env.MYSQL_USERNAME,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE
});


connection.connect(function(err) {
	if (err) throw err;
	console.log("MySQL connected as id " + connection.threadId);
});

class HideCommand extends Command {
	constructor() {
		super("hide", {
			aliases: ["hide"],
			description: "Hide a present!"
		});
	}

	async exec(message) {
		const args = message.content.slice(5).trim().split(" ");
		if (args.length == 1) {
		    return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		} else {
			let serverID = message.guild.id;
      let serverName = message.guild.name;
			let channelID = message.channel.id;
      let channelName = message.channel.name;
			let userID = message.author.id;
      let userName = message.member.user.tag;
			let tspecs = {code: `${args[0]}`, presentLevel: args[1], timesFound: 0, serverName: `${serverName}`, serverID: serverID, channelName: `${channelName}`, channelID: channelID, hiddenByName: `${userName}`, hiddenByID: userID};
			let query = connection.query("INSERT INTO presents SET ?", tspecs, (err, result) => {
				message.channel.send("Created a present with the code of `" + args[0] + "` and a difficulty of `" + args[1] + "`.");
	     if(err) throw err;
	     console.log(result);
			}
			);}}
}

module.exports = HideCommand;
