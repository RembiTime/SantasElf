import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { showPages } from "../util/discord";
import { chunk } from "../util/array";

class HelpCommand extends Command {
	constructor() {
		super("help", {
			aliases: ["help", "?", "rpspleasehelpihavenoideawhattodo", "commands"],
			description: "Shows a list of commands",
		});
	}

	async exec(message: Message) {
		const embedArr: MessageEmbed[] = [];
		for (const commands of chunk(this.client.commandHandler.modules.array(), 10)) {
			const embed = new MessageEmbed();
			for (const command of commands) embed.addField(command.id, command.description, true);
			embedArr.push(embed);
		}
		showPages(embedArr, message.channel, message.author, 120000);
	}
}

export = HelpCommand;
