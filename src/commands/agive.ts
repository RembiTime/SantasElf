import { Argument, Command } from "discord-akairo";

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

	async exec(message, { user, presentLevel, amount }) {
		await user.givePresent(presentLevel, amount);
		await message.channel.send(`Gave ${amount} level ${presentLevel} present(s) to ${user}`);
	}
}

export = AdminGiveCommand;
