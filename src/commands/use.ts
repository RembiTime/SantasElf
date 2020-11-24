import { Command } from "discord-akairo";
import { items } from "../items";

class UseCommand extends Command {
	constructor() {
		super("use", {
			aliases: ["use"],
			description: "Use an item",
			args: [{
				id: "itemName",
				type: "string"
			}]
		});
	}

	async exec(message, { itemName }) {
		const newUserCheck = this.client.database.userDataCheck({ userID: message.author.id });
		if (newUserCheck === null) {
			await this.client.database.addNewUser({userID: message.author.id});
		}

		const item = items.find(item => item.id === itemName || item.displayName === itemName);
		if (item && "worth" in item) {
			message.channel.send("This item can't be used! Try `,sell`ing it instead.");
			return;
		} else if (item && "rank" in item) {
			if (item.id === "fractal" || item.id === "slime" || item.id === "spanner" || item.id === "dragon" || item.id === "mysteriousPart") {
				message.channel.send("You can't use that item... Maybe you have to build something with it?");
				return;
			}
			if (item.id === "mistletoe") {
				const itemCheck = await this.client.database.itemCheck({userID: message.author.id, itemName: "mistletoe"});
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				}
				this.client.database.useMistletoe({ message: message });
			}
			else if (item.id === "meme") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "meme" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				}
				this.client.database.useMeme({ message: message });
			}
			else if (item.id === "palette") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "palette" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				} if (this.client.minigamePlayers.has(message.author.id)) {
					message.channel.send("There is already an ongoing game! Please finish that first");
					return;
				}
				this.client.database.usePalette({ message: message });
			}
			else if (item.id === "watch") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "watch" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				} if (this.client.minigamePlayers.has(message.author.id)) {
					message.channel.send("There is already an ongoing game! Please finish that first");
					return;
				}
				this.client.database.useWatch({ message: message });
			}
			else if (item.id === "role") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "role" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				} if (message.guild.id !== "647915068767338509") {
					message.channel.send("Please send this command SMPEarth Discord to use this item. https://discord.gg/y5BfFjP")
					return;
				} if (message.member.roles.cache.has("778022401858338846")) {
					message.channel.send("You already have the role, so take 150 candy canes instead!");
					await this.client.database.addCandyCanes({ amount: 150, userID: message.author.id });
					await this.client.knex("items").where({ name: "role", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
					return;
				} else {
					message.channel.send("Hey, you special snowflake. Take this exclusive role and keep being special.")
					message.member.roles.add("778022401858338846");
					await this.client.knex("items").where({ name: "role", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
					return;
				}
			}
			else if (item.id === "dragonEgg") {
				const itemCheck = await this.client.database.itemCheck({ userID: message.author.id, itemName: "dragonEgg" });
				if (itemCheck === null || itemCheck.amount < 1) {
					message.channel.send("You don't have any of that item!");
					return;
				}
				const eggData = await this.client.knex("eggData").first('*').where({userID: message.author.id, status: "UNCLAIMED"});
				let eggAge = Date.now() - Number(eggData.timeFound);
				if (eggAge < 86400000) {
					let minsLeft = Math.floor((86400000 - eggAge) / 60000);
					let hoursLeft = Math.round(minsLeft / 60)
					minsLeft = minsLeft % 60;
					message.channel.send("The egg is still hatching! Please wait " + hoursLeft + " hours and " + minsLeft + " minutes.")
					return;
				} else if (eggAge < 172800000) {
					let eggCount = await this.client.knex("eggData")
						.count("eggID", { as: "eggCount" })
						.where({ userID: message.author.id, status: "UNCLAIMED" })
						.then(([{ eggCount }]) => eggCount as number);
					if (eggCount > 2) {
						message.channel.send("Your dragon hatched... TODO. You have " + --eggCount + " eggs left unhatched!")
					} else if (eggCount === 2) {
						message.channel.send("Your dragon hatched... TODO. You have 1 egg left unhatched!")
					} else {
						message.channel.send("Your dragon hatched... TODO")
					}
					await this.client.database.addCandyCanes({ amount: 150, userID: message.author.id });
					await this.client.knex("eggData").where({eggID: eggData.eggID}).update({status: "CLAIMED"});
					await this.client.knex("items").where({ name: "dragonEgg", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
					return;
				} else {
					message.channel.send("Sadly the egg has gone cold, and so has the life within. Well, at least you have breakfast!")
					await this.client.knex("eggData").where({eggID: eggData.eggID}).update({status: "LOST"});
					await this.client.knex("items").where({ name: "dragonEgg", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
				}
			}
		} else {
			message.channel.send("That item does not exist!");
		}
	}
}

export = UseCommand;
