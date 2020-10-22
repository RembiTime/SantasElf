const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const { showPages } = require("../util/discord");

class InventoryCommand extends Command {
	constructor() {
		super("inventory", {
			aliases: ["inventory", "inv"],
			description: "Checks your inventory"
		});
	}

	async exec(message) {
		const newUserCheck = await this.client.database.userDataCheck({ userID: message.author.id });

		if (newUserCheck === null) {
			await this.client.database.addNewUser({
				userID: message.author.id,
				userName: message.member.user.tag
			});
		}

		const userData = await this.client.database.userDataCheck({ userID: message.author.id });

		const hexColor = Math.random() < 0.5 ? "#FF5A5A" : "#8DFF5A";

		const inventoryPage1 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Presents")
			.setFooter("Page 1")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Level 1 Presents", value: userData.lvl1Presents + " in your inventory\n" + userData.lvl1Total + " total", inline: true},
				{name: "Level 2 Presents", value: userData.lvl2Presents + " in your inventory\n" + userData.lvl2Total + " total", inline: true},
				{name: "Level 3 Presents", value: userData.lvl3Presents + " in your inventory\n" + userData.lvl3Total + " total", inline: true},
				{name: "Level 4 Presents", value: userData.lvl4Presents + " in your inventory\n" + userData.lvl4Total + " total", inline: true},
				{name: "Level 5 Presents", value: userData.lvl5Presents + " in your inventory\n" + userData.lvl5Total + " total", inline: true},
				{name: "\u200B", value: "\u200B"},
				{name: "Candy Canes:", value: userData.candyCanes},
			);

		const inventoryPage2 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Negative Items")
			.setFooter("Page 2")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Coal", value: userData.coalAmt + " in your inventory\n" + userData.coalTotal + " total", inline: true},
				{name: "Dirt", value: userData.dirtAmt + " in your inventory\n" + userData.dirtTotal + " total", inline: true},
				{name: "Geese", value: userData.gooseTotal + " found", inline: true},
			);

		const inventoryPage3 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Common Items")
			.setFooter("Page 3")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Ornaments", value: userData.ornamentAmt + " in your inventory\n" + userData.ornamentTotal + " total", inline: true},
				{name: "Plushes", value: userData.plushAmt + " in your inventory\n" + userData.plushTotal + " total", inline: true},
				{name: "Socks", value: userData.socksAmt + " in your inventory\n" + userData.socksTotal + " total", inline: true},
				{name: "Rubber Ducks", value: userData.duckAmt + " in your inventory\n" + userData.duckTotal + " total", inline: true},
				{name: "Pencils", value: userData.pencilsAmt + " in your inventory\n" + userData.pencilsTotal + " total", inline: true},
				//{name: "Cardboard Boxes", value: userData.boxAmt + " in your inventory\n" + userData.boxTotal + " total", inline: true},
				{name: "Pumpkins", value: userData.pumpkinAmt + " in your inventory\n" + userData.pumpkinTotal + " total", inline: true},
				{name: "Oranges", value: userData.orangeAmt + " in your inventory\n" + userData.orangeTotal + " total", inline: true},
				{name: "Shirts", value: userData.shirtAmt + " in your inventory\n" + userData.shirtTotal + " total", inline: true},
				{name: "Chocolates", value: userData.chocolateAmt + " in your inventory\n" + userData.chocolateTotal + " total", inline: true},
				{name: "Footballs", value: userData.footballAmt + " in your inventory\n" + userData.footballTotal + " total", inline: true},
				{name: "Other Footballs", value: userData.football2Amt + " in your inventory\n" + userData.football2Total + " total", inline: true},
				{name: "Singular Candy Canes", value: userData.singleCandyTotal + " found", inline: true},
			);

		const inventoryPage4 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Uncommon Items")
			.setFooter("Page 4")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Trees", value: userData.treeAmt + " in your inventory\n" + userData.treeTotal + " total", inline: true},
				{name: "Giftcards", value: userData.giftcardAmt + " in your inventory\n" + userData.giftcardTotal + " total", inline: true},
				{name: "Figurines", value: userData.figurineAmt + " in your inventory\n" + userData.figurineTotal + " total", inline: true},
				{name: "Snowglobes", value: userData.snowglobeAmt + " in your inventory\n" + userData.snowglobeTotal + " total", inline: true},
				{name: "Palettes", value: userData.paletteAmt + " in your inventory\n" + userData.paletteTotal + " total", inline: true},
				{name: "Mistletoe", value: userData.mistletoeAmt + " in your inventory\n" + userData.mistletoeTotal + " total", inline: true},
				{name: "Memes", value: userData.memeAmt + " in your inventory\n" + userData.memeTotal + " total", inline: true},
				{name: "Pins", value: userData.pinAmt + " in your inventory\n" + userData.pinTotal + " total", inline: true},
				{name: "Blankets", value: userData.blanketAmt + " in your inventory\n" + userData.blanketTotal + " total", inline: true},
				{name: "Headphones", value: userData.headphonesAmt + " in your inventory\n" + userData.headphonesTotal + " total", inline: true},
				{name: "Video Games", value: userData.gameAmt + " in your inventory\n" + userData.gameTotal + " total", inline: true},
				{name: "Keyboards", value: userData.keyboardTotal + " found", inline: true},
			);

		const inventoryPage5 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Rare Items")
			.setFooter("Page 5")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Santa's Hats", value: userData.hatAmt + " in your inventory\n" + userData.hatTotal + " total", inline: true},
				{name: "Consoles", value: userData.consoleAmt + " in your inventory\n" + userData.consoleTotal + " total", inline: true},
				{name: "Computers", value: userData.computerAmt + " in your inventory\n" + userData.computerTotal + " total", inline: true},
				{name: "Watches", value: userData.watchAmt + " in your inventory\n" + userData.watchTotal + " total", inline: true},
				{name: "Mysterious Parts", value: userData.mysteriousPartAmt + " in your inventory\n" + userData.mysteriousPartTotal + " total", inline: true},
				{name: "Puppies", value: userData.puppyAmt + " in your inventory\n" + userData.puppyTotal + " total", inline: true},
				{name: "Swords", value: userData.swordAmt + " in your inventory\n" + userData.swordTotal + " total", inline: true},
				{name: "Cats", value: userData.catAmt + " in your inventory\n" + userData.catTotal + " total", inline: true},
				{name: "Simps", value: userData.simpTotal + " found", inline: true},
			);

		const inventoryPage6 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Legendary Items")
			.setFooter("Page 6")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Cars", value: userData.carAmt + " in your inventory\n" + userData.carTotal + " total", inline: true},
				{name: "Dragon Eggs", value: userData.dragonEggAmt + " in your inventory\n" + userData.dragonEggTotal + " total", inline: true},
				{name: "Spanners", value: userData.spannerAmt + " in your inventory\n" + userData.spannerTotal + " total", inline: true},
				{name: "Slimes", value: userData.slimeAmt + " in your inventory\n" + userData.slimeTotal + " total", inline: true},
				{name: "Dragons", value: userData.dragonAmt + " in your inventory\n" + userData.dragonTotal + " total", inline: true},
				{name: "Fractals", value: userData.fractalAmt + " in your inventory\n" + userData.fractalTotal + " total", inline: true},
				{name: "Roles", value: userData.roleTotal + " found", inline: true},
			);

		const inventoryPage7 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Mythic Items")
			.setFooter("Page 7")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Ownerships of SMPEarth", value: userData.ownershipAmt + " in your inventory\n" + userData.ownershipTotal + " total", inline: true},
				{name: "Corn", value: userData.cornAmt + " in your inventory\n" + userData.cornTotal + " total", inline: true},
				{name: "Glitches", value: userData.glitchTotal + " found", inline: true},
			);

		const inventoryPage8 = new Discord.MessageEmbed()
			.setColor(hexColor)
			.setTitle("Unique Items")
			.setFooter("Page 8")
			.setAuthor(message.member.user.tag, message.member.user.avatarURL(), message.member.user.avatarURL())
			.addFields(
				{name: "Music Discs", value: userData.ownershipAmt + " in your inventory\n" + userData.ownershipTotal + " total", inline: true},
				{name: "Broken Planes", value: userData.cornAmt + " in your inventory\n" + userData.cornTotal + " total", inline: true},
				{name: "Big Triangles", value: userData.cornAmt + " in your inventory\n" + userData.cornTotal + " total", inline: true},
				{name: "Dupe Machines", value: userData.dupeTotal + " found", inline: true},
			);

		showPages([inventoryPage1, inventoryPage2, inventoryPage3, inventoryPage4, inventoryPage5, inventoryPage6, inventoryPage7, inventoryPage8], message.channel, message.author, 120000);

	}
}

module.exports = InventoryCommand;
