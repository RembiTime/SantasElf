const { Command } = require("discord-akairo");

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
			let query = this.client.database.query("INSERT INTO presents SET ?", tspecs, (err, result) => {
				message.channel.send("Created a present with the code of `" + args[0] + "` and a difficulty of `" + args[1] + "`.");
	     if(err) throw err;
	     console.log(result);
			}
			);}}
}

module.exports = HideCommand;
