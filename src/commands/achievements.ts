import { Command } from "discord-akairo";
import { Message /*, MessageEmbed */  } from "discord.js";
// import { range } from "../util/array";
// import { showPages } from "../util/discord";

class AchievementCommand extends Command {
	constructor() {
		super("achievements", {
			aliases: ["ach", "achievements"],
			description: "Brings up the achievements menu"
		});
	}

	async exec(message: Message) {
		message.channel.send("WIP");
		return;
		/*
		const pages: MessageEmbed[] = [];

		const achievements = await message.author.fetchAchievements();

		for (const { achievement, tiers } of achievements) {
			const title = range(1, achievement.tiers.length + 1).map(
				tier => tiers.includes(tier) ? "🟩" : "🟥"
			).join("");

			const tiersField = achievement.tiers.map((tier, i) => (
				tiers.includes(i)
					? `**${tier.displayName}** (${tier.displayName})`
					: `${tier.displayName} (${tier.displayName})`
			)).join("\n");

			const embed = new MessageEmbed()
				.setTitle(title)
				.addField("Tiers", tiersField);

			pages.push(embed);
		}

		if (pages.length) {
			showPages(pages, message.channel, message.author);
		} else {
			await message.channel.send("You don't have any achievements yet!");
		}
		*/
	}
}

export = AchievementCommand;
