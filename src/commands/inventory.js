const { Command } = require("discord-akairo");
const { partition } = require("../util/array");
const { showPages } = require("../util/discord");
const { MessageEmbed } = require("discord.js");

class InventoryCommand extends Command {
	constructor() {
		super("inventory", {
			aliases: ["inventory", "inv"],
			description: "Checks your inventory"
		});
	}

	async exec(message) {
		const items = await this.client.database.getAllItems(message.author.id);

		if (items.length === 0) {
			await message.channel.send(`You don't have any items, ${message.author}!`);
			return;
		}

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const itemSets = partition(item => item.item.rank, items).sort((x, y) => x[0].item.rank - y[0].item.rank);
		const rankNames = ["Negative", "Common", "Uncommon", "Rare", "Legendary", "Mythic", "Unique"];

		const pages = itemSets.map((itemSet, i) => new MessageEmbed()
			.setColor(hexColor)
			.setTitle(`${rankNames[itemSet[0].item.rank]} items`)
			.addFields(itemSet.map(({ item, amount, record }) => ({
				name: item.displayName, value: `${amount} in your inventory\n${record} total`, inline: true
			})))
			.setFooter(`Page ${i + 1}`)
		);

		showPages(pages, message.channel, message.author, 120000);
	}
}

module.exports = InventoryCommand;
