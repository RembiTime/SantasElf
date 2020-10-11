const { Command } = require("discord-akairo");

class FoundCommand extends Command {
	constructor() {
		super("found", {
			aliases: ["found"],
			description: "Command to be used when you find a present",
			args: [{
				id: "code",
				type: "string"
			}]
		});
	}

	async exec(message, { code }) {
		const present = await this.client.database.getPresent({ code, serverID: message.guild.id });
		const dupeCheck = await this.client.database.findIfDupe({ userID: message.author.id, presentCode: code });
		const newUserCheck = await this.client.database.findIfFirstPresent({ userID: message.author.id });
		const globalStats = await this.client.database.getGlobalStats();
		let isHider = false;

		// Used to create global stats -- Uneeded: await this.client.database.startGlobalStats({id: code})

		if (newUserCheck === null) {
			await this.client.database.addNewUser({
				userID: message.author.id,
				userName: message.member.user.tag
			});
		}

		//URGENT TODO: put something here so that the code will only run once the info is added to the DB. Applies to all database functions.

		//Check if the finder is also the hider

		if (message.author.id == present.hiddenByID) {
			isHider = true
		}

		if (present === null) {
			this.client.database.incrementUserWrongGuesses(message.author.id);
			this.client.database.incrementGlobalWrongGuesses();
			console.log(newUserCheck.userName + " guessed '" + code + "'! " + newUserCheck.userName + " has answered wrong " + newUserCheck.wrongGuesses + " times. There have been " + globalStats.wrongGuesses + " wrong guesses total")
			message.channel.send("That present does not exist!");
			return;
		}

		if (dupeCheck !== null) {
			message.channel.send("You've already claimed that present!");
			return;
		}

		if (isHider == true){
			message.channel.send("You can't claim a present that you hid!");
			return;
		}

		//Need it twice because top allows for Wrong Guess Count, this is for amount of users with one present
		if (newUserCheck === null) {
			this.client.database.incrementGlobalUsersWithPresents();
			console.log(newUserCheck.userName + " just recieved their first present! There are now " + globalStats.usersWithPresents + " users playing!")
		}

		this.client.database.incrementPresentFindCount(present.id);
		this.client.database.incrementUserTotalPresents(message.author.id);
		this.client.database.incrementGlobalPresentsFound();
		console.log(newUserCheck.userName + " found present code '" + code + "' in " + present.serverName + ". That present has been found " + present.timesFound + " times. " + newUserCheck.userName + " has found " + newUserCheck.totalPresents + " presents and " + globalStats.presentsFound + " presents have been found globally.")

		// TODO: fix this race condition
		 if (present.timesFound === 0) {
			this.client.database.incrementUserFirstFinder(message.author.id);
			console.log(newUserCheck.userName + " has found present code '" + code + "' in " + present.serverName + " first! They've found " + newUserCheck.firstFinder + " presents first!")
			await this.client.database.presentFound({
				userID: message.author.id,
				userName: message.member.user.tag,
				presentCode: code
			});
			message.channel.send("You were the first one to find this present! It had a difficulty of `" + present.presentLevel + "`.");
		} else {
			await this.client.database.presentFound({
				userID: message.author.id,
				userName: message.member.user.tag,
				presentCode: code
			});
			message.channel.send("You just claimed the present! It had a difficulty of `" + present.presentLevel + "`.");
		}
	}
}

module.exports = FoundCommand;
