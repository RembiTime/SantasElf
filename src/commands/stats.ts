import { Command } from "discord-akairo";
import { Message, MessageEmbed, DiscordAPIError } from "discord.js";
import { showPages } from "../util/discord";

class StatsCommand extends Command {
	constructor() {
		super("stats", {
			aliases: ["stats", "statistics"],
			description: "Checks the statistics"
		});
	}

	async exec(message: Message) {
		await message.author.ensureDB();
		const [{ presentsFound }] = await this.client.knex("foundPresents")
			.countDistinct("id", { as: "presentsFound" });

		const [{ wrongGuesses }] = await this.client.knex("userData")
			.sum({ wrongGuesses: "wrongGuesses"} );

		const [{ usersWithPresents }] = await this.client.knex("foundPresents")
			.countDistinct("userID", { as: "usersWithPresents" });

		const [{ guildTotal }] = await this.client.knex("presents")
			.countDistinct("guildID", { as: "guildTotal" });

		const userPresents = (await Promise.all([1, 2, 3, 4, 5].map(async x =>
			await this.client.knex("userData").sum(`lvl${x}Total`, { as: `userLvl${x}Presents` }).where({userID: message.author.id})))).flat().map((x, i) => x[`userLvl${i+1}Presents`]);

		const totalUserPresents = userPresents.reduce((l, c) => l + +c, 0)

		const [userWrongGuesses] = await this.client.knex("userData")
			.select("wrongGuesses").where({userID: message.author.id});

		const [foundFirst] = await this.client.knex("userData")
			.select("firstFinder").where({userID: message.author.id});

		const [{ totalPresents}] = await this.client.knex("presents").countDistinct("code", { as: "totalPresents" })

		const ccLeaderboard = await this.client.knex("userData").orderBy("candyCanes", "DESC").limit(15)
		const topUsernames = await Promise.all(ccLeaderboard.map(async x => {
			try { return (await this.client.users.fetch(x.userID))?.tag }
			catch (e) {
			if (!(e instanceof DiscordAPIError)) throw e;
			else return null;
			}
			}));
			
		console.log(topUsernames)

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const uStatsEmbed = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("User Statistics")
			.addField("Presents:", "Total presents found: " + totalUserPresents + "\n\nTotal level 1 presents found: " + userPresents[0] + "\nTotal level 2 presents found: " + userPresents[1] + "\nTotal level 3 presents found: " + userPresents[2] + "\nTotal level 4 presents found: " + userPresents[3] + "\nTotal level 5 presents found: " + userPresents[4])
			.addField("Guesses:", "Wrong guesses: " + userWrongGuesses.wrongGuesses + "\nTimes you've found a present first: " + foundFirst.firstFinder);

		const gstatsEmbed = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Global Statistics")
			.addField("Presents:", "Total presents hidden: " + totalPresents + "\nTotal presents found: " + presentsFound)
			.addField("Stats:", "Wrong guesses: " + wrongGuesses + "\nUsers playing: " + usersWithPresents + "\nServers participating: " + guildTotal + "\nAchievements found: TODO");

		const leaderboardEmbed = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Candy Cane Leaderboard")
		for (const i of topUsernames) {
			leaderboardEmbed.setDescription("**" + i + "**: " + "TODO: Candy cane amt")
		}
		
		const pages = [uStatsEmbed, gstatsEmbed];

		showPages(pages, message.channel, message.author, 120000);
	}
}

export = StatsCommand;
