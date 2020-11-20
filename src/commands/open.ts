import { Argument, Command } from "discord-akairo";
import { Message } from "discord.js";
import { items } from "../items";
import { partition } from "../util/array";

const ranks = new Map(partition(item => item.rank, items).map(rank => [rank[0].rank, rank]));

const generateRarity = function(presentLevel: number) {
	// Rows are weights for present ranks for different present levels
	const weights = [
		[10, 45, 25, 15, 4, 1],
		[10, 35, 25, 20, 8, 2],
		[10, 25, 25, 25, 12, 3],
		[10, 15, 20, 30, 20, 5],
		[10, 10, 15, 20, 30, 15]
	][presentLevel - 1];

	const cumulativeDist = weights.slice(1).reduce((result, val) => {
		result.push(result[result.length - 1] + val);
		return result;
	}, [weights[0]]);

	const max = cumulativeDist[cumulativeDist.length - 1];
	const rand = Math.random() * max;

	const result = cumulativeDist.findIndex(val => val >= rand);

	if (result === -1) {
		throw new Error("This should never be executed");
	}

	return result;
};

class OpenCommand extends Command {
	constructor() {
		super("open", {
			aliases: ["open"],
			description: "Open a present!",
			args: [{
				id: "presentLevel",
				type: Argument.range("integer", 1, 5, true)
			}]
		});
	}

	async exec(message: Message, { presentLevel }: { presentLevel: number } ) {
		await this.client.knex.transaction(async trx => {
			const hadEnough = await message.author.removePresents(presentLevel, 1, trx);

			if (hadEnough) {
				const presentRarity = generateRarity(presentLevel);
				const candidates = ranks.get(presentRarity)!;

				const item = candidates[Math.floor(Math.random() * candidates.length)];

				if (item.defaultBehavior) {
					await message.author.giveItem(item, trx);
				}

				if (typeof item.onFind === "function") {
					await item.onFind(this.client, message);
				}

				if (item.response) {
					await message.channel.send(item.response);
				}
			} else {
				await message.channel.send("You don't have any level " + presentLevel + " presents to open!");
			}
		});
	}
}

export = OpenCommand;
