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
		const userData = await this.client.database.userDataCheck({ userID: message.author.id });
		const items = await this.client.database.getAllItems({ userID: message.author.id });

		if (items.length === 0) {
			await message.channel.send(`You don't have any items, ${message.author}!`);
			return;
		}

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const candyCanePage = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Candy Canes")
			.setDescription(`You have ${userData.candyCanes} candy canes`);

		const presentsPage = new MessageEmbed()
			.setColor(hexColor)
			.setTitle("Presents")
			.addField("Level 1 presents", userData.lvl1Presents, true)
			.addField("Level 2 presents", userData.lvl2Presents, true)
			.addField("Level 3 presents", userData.lvl3Presents, true)
			.addField("Level 4 presents", userData.lvl4Presents, true)
			.addField("Level 5 presents", userData.lvl5Presents, true);

		const itemSets = partition(item => item.item.rank, items).sort((x, y) => x[0].item.rank - y[0].item.rank);
		const rankNames = ["Negative", "Common", "Uncommon", "Rare", "Legendary", "Mythic", "Unique"];
		const rankPics = ["https://i.imgur.com/TtiJNGG.png", "https://i.imgur.com/oazdKuu.png", "https://i.imgur.com/4MC50bd.png", "https://i.imgur.com/6fIQ6fT.png", "https://i.imgur.com/riRGZKp.png", "https://i.imgur.com/1cEZyOx.png", "https://i.imgur.com/1cEZyOx.png"]

		const itemsetPages = itemSets.map((itemSet) => new MessageEmbed()
			.setColor(hexColor)
			.setTitle(`${rankNames[itemSet[0].item.rank]} items`)
			.setThumbnail(rankPics[itemSet[0].item.rank])
			.addFields(itemSet.map(({ item, amount, record }) => ({
				name: item.displayName, value: `${amount} in your inventory\n${record} total`, inline: true
			})))
		);

		// .setFooter(`Page ${i + 3}`)

		const pages = [candyCanePage, presentsPage, ...itemsetPages];
		pages.forEach((page, i) => page.setFooter(`Page ${i + 1} / ${pages.length}`));

		showPages(pages, message.channel, message.author, 120000);
	}
}

module.exports = InventoryCommand;
