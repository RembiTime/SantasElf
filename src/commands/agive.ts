import { Argument, Command } from "discord-akairo";
import { Message, User } from "discord.js";

class AdminGiveCommand extends Command {
	constructor() {
		super("agive", {
			aliases: ["agive"],
			description: "Gives a present",
			ownerOnly: true,
			args: [
				{
					id: "user",
					type: "user"
				},
				{
					id: "presentLevel",
					type: Argument.range("integer", 1, 5, true)
				},
				{
					id: "amount",
					type: "integer"
				}
			]
		});
	}

	async exec(message: Message, { user, presentLevel, amount }: { user: User, presentLevel: number, amount: number }) {
		await user.givePresents(presentLevel, amount);
		await message.channel.send(`Gave ${amount} level ${presentLevel} present(s) to ${user}`);
	}
}

export = AdminGiveCommand;
