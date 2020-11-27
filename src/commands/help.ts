import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { showPages } from "../util/discord";
import { chunk } from "../util/array";

class HelpCommand extends Command {
	constructor() {
		super("help", {
			aliases: ["help", "?", "rpspleasehelpihavenoideawhattodo", "commands"],
			description: "Shows you this list of commands",
		});
	}

	async exec(message: Message) {
		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";
		const embedArr: MessageEmbed[] = [];
		for (const commands of chunk(this.client.commandHandler.modules.filter(x => !x.ownerOnly).array(), 12)) {
			const embed = new MessageEmbed()
			.setTitle("Help Menu")
			.setColor(hexColor);
			for (const command of commands) embed.addField(command.id, command.description, true);
			embedArr.push(embed);
		}
		showPages(embedArr, message.channel, message.author, 120000);
	}
}

export = HelpCommand;
