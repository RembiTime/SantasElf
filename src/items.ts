// TODO: make handlers atomic
// TODO: handle present level updates

import type { Message, Client } from "discord.js";
import type { Extension } from ".";
export interface Item {
	id: string;
	rank: number;
	worth?: number;
	displayName: string;
	messageName?: string;
	response?: string;
	defaultBehavior?: boolean;
	onFind?(client: Client & Extension, message: Message): unknown | Promise<unknown>;
	use?(message: Message): Promise<void>
}

export const items: Item[] = [
	{
		id: "coal",
		rank: 0,
		worth: 0,
		displayName: "Coal",
		messageName: "a piece of coal",
		response: "Uh oh... Looks like you got on the naughty list. You found coal."
	},
	{
		id: "goose",
		rank: 0,
		displayName: "Goose",
		response: "Honk! The present is torn open and out pops a very naughty goose! In your bewilderment, it stole 20 of your candy canes",
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.knex("items")
				.insert({ name: "goose", userID: message.author.id, amount: 1, record: 1 })
				.onConflict("userID")
				.merge({
					amount: client.knex.raw("amount + 1"),
					record: client.knex.raw("GREATEST(amount, record)")
				});
			/* Just in case...
			await client.database.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, ["goose", message.author.id]); */
			await client.knex("userData").where({ userID: message.author.id }).decrement("candyCanes", 20);
			//await client.database.foundAchievement({achName: findGoose, userID: message.author.id, message: message})
		}
	},
	{
		id: "dirt",
		rank: 0,
		worth: 0,
		displayName: "Dirt",
		messageName: "a piece of dirt",
		response: "You open the present to find dirt... fun." //changed: punctuation -Walrus
	},
	{
		id: "ornament",
		rank: 1,
		worth: 5,
		displayName: "Ornament",
		messageName: "an ornament",
		response: "You found an ornament! That doesn't really do you much good since you've already decorated your tree." //changed: reworded -Walrus
	},
	{
		id: "plush",
		rank: 1,
		worth: 8,
		displayName: "Plush",
		messageName: "a plush toy",
		response: "You found a stuffed animal! It isn't worth much, but it makes a good companion."
	},
	{
		id: "socks",
		rank: 1,
		worth: 2,
		displayName: "Socks",
		messageName: "some socks",
		response: "You found a pair of socks! Why do people always give me socks?" //changed: reworded -Walrus
	},
	{
		id: "duck",
		rank: 1,
		worth: 4,
		displayName: "Rubber Duck",
		messageName: "a rubber duck",
		response: "You found a rubber duck! Cheap plastic has never been so lovable! You will cherish your new friend forever." //changed: reworded -Walrus
	},
	{
		id: "pencils",
		rank: 1,
		worth: 3,
		displayName: "Pencils",
		messageName: "a box of pencils",
		response: "You found a box of pencils! Who does their christmas shopping at Office Depot?" //changed: reworked -Walrus
	},
	/*{
		id: "box",
		rank: 1,
		worth: 1,
		displayName: "Box",
		response: "You found a cardboard box! You feel a deep primal urge to sit in it." //changed: reworded -Walrus
	},*/
	{
		id: "pumpkin",
		rank: 1,
		worth: 2,
		displayName: "Pumpkin",
		messageName: "a pumpkin",
		response: "You found a pumpkin! Blech! It smells like it's been in there since Halloween." //changed: reworded -Walrus
	},
	{
		id: "orange",
		rank: 1,
		worth: 3,
		displayName: "Orange",
		messageName: "an orange",
		response: "You found an orange! Why did someone feel the need to give you this? You take a minute to contemplate the subtle intricacies of human interaction." //changed highbrow humor aquired -Walrus
	},
	{
		id: "shirt",
		rank: 1,
		worth: 6,
		displayName: "Shirt",
		messageName: "a shirt",
		response: "You found a shirt! Great, more clothes. At least its clean." //changed: added a bit -Walrus
	},
	{
		id: "chocolate",
		rank: 1,
		worth: 7,
		displayName: "Chocolate",
		messageName: "a box of choclates",
		response: "You found a box of chocolate! Well, that's Valentine's day sorted!" //changed: reworked -Walrus
	},
	{
		id: "football",
		rank: 1,
		worth: 6,
		displayName: "Football",
		messageName: "a football",
		response: "You found a football! Which football is it, though?" //changed: Grammar -Walrus
	},
	{
		id: "football2",
		rank: 1,
		worth: 6,
		displayName: "Football2",
		messageName: "a football",
		response: "You found a football! Which football is it, though?" //changed: Grammar -Walrus
	},
	{
		id: "singleCandy",
		rank: 1,
		displayName: "singleCandy",
		response: "You found a singular candy cane! Make sure not to spend it all in one place!", // changed: reworded, also what the fuck? -Walrus
		onFind: async (client, message) => {
			await client.knex("items")
				.insert({ name: "singleCandy", userID: message.author.id, amount: 1, record: 1 })
				.onConflict("userID")
				.merge({
					amount: client.knex.raw("amount + 1"),
					record: client.knex.raw("GREATEST(amount, record)")
				});
			/*await client.database.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, ["singleCandy", message.author.id]);*/
			await client.knex("userData").where({ userID: message.author.id }).increment("candyCanes", 1);
		}
	},
	{
		id: "tree",
		rank: 2,
		worth: 13,
		displayName: "Tree",
		messageName: "a tree",
		response: "Nice! You found an entire tree! How did they even fit this into the box?" //changed: reworded -Walrus
	},
	{
		id: "giftcard",
		rank: 2,
		worth: 20,
		displayName: "Giftcard",
		response: "Nice! You found a giftcard! It's worth 20 candy canes!"
	},
	{
		id: "figurine",
		rank: 2,
		worth: 18,
		displayName: "Figurine",
		messageName: "a figurine",
		response: "Nice! You found a figurine! A fine addition to your collection." //changed: prequelmeme -Walrus
	},
	{
		id: "snowglobe",
		rank: 2,
		worth: 15,
		displayName: "Snowglobe",
		messageName: "a snowglobe",
		response: "Nice! You found a snowglobe! It's a winter wonderland on the go!" //changed: reworked -Walrus
	},
	{
		id: "palette",
		rank: 2,
		displayName: "Palette",
		response: "Nice! You found an paint palette! Time to make some happy little trees!\n**This is a minigame item! When you would like to play, send the command `,use palette`!**", //changed: Bob Ross -Walrus
		async use(message) {
			message.client.minigamePlayers.add(message.author.id);
			let colorArray = ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬜", "⬛", "🟫",];
			colorArray = colorArray.sort(() => Math.random() - 0.5);
			let finalArray = message.client.database.stringInsert(colorArray, 3).map(x => x.join("")).join("\n");
			let answer = Math.floor(Math.random() * 9);
			const lookupMap = {
				"🟥": "red",
				"🟧": "orange",
				"🟨": "yellow",
				"🟩": "green",
				"🟦": "blue",
				"🟪": "purple",
				"⬜": "white",
				"⬛": "black",
				"🟫": "brown",
			};
			const answerString = lookupMap[colorArray[answer]];
			let sent = await message.channel.send(finalArray);
			const botMessage = await message.channel.messages.fetch(sent.id);
			let seconds = 10;
			const msg = await message.channel.send(`Memorize these colors, they will disappear in ${seconds} seconds`);
			const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
			for (const x of numberEmojis) botMessage.react(x);
			const timer = setInterval(async () => {
				seconds = seconds - 2;
				await msg.edit(`Memorize these colors, they will disappear in ${seconds} seconds`);
				if (seconds <= 0) {
					clearInterval(timer);
					sent.edit("1️⃣2️⃣3️⃣\n4️⃣5️⃣6️⃣\n7️⃣8️⃣9️⃣");
					await msg.edit("Click which number " + answerString + " was");
					const filter = (reaction, user) => {
						return ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"].includes(reaction.emoji.name) && user.id === message.author.id;
					};
					const reaction = (await botMessage.awaitReactions(filter, { max: 1, time: 30000 }));
					if (reaction.size === 0) {
						message.client.minigamePlayers.delete(message.author.id);
						msg.edit("You didn't answer in time! Please run the command again to try again.");
						return;
					}

					const lookupMap = {
						"1️⃣": 0,
						"2️⃣": 1,
						"3️⃣": 2,
						"4️⃣": 3,
						"5️⃣": 4,
						"6️⃣": 5,
						"7️⃣": 6,
						"8️⃣": 7,
						"9️⃣": 8,
					};
					const reactionAnswer = lookupMap[reaction.first()!.emoji.name];
					if (reactionAnswer !== answer) {
						await message.client.minigamePlayers.delete(message.author.id);
						await message.client.database.removeItem({ itemName: "palette", userID: message.author.id });
						answer = answer + 1;
						await message.client.database.addLog(`${message.author.id} guessed incorrectly when using a palette`);
						msg.edit("That's incorrect, it was " + answer + ". Try again next time!");
						return;
					} else {
						await message.author.giveCandyCanes(25);
						await message.client.minigamePlayers.delete(message.author.id);
						await message.client.database.removeItem({ itemName: "palette", userID: message.author.id });

						const [ccAmt] = await message.client.knex("userData").select("candyCanes").where({ userID: message.author.id });
						await message.client.database.addLog(`${message.author.id} guessed correctly when using a palette. They now have ${ccAmt.candyCanes} candy canes`);
						await msg.edit("That's correct! You got 25 candy canes!");
						return;
					}
				}
			}, 2000);
		}
	},
	{
		id: "mistletoe",
		rank: 2,
		displayName: "Mistletoe",
		response: "Nice! You found some mistletoe! Who would've left this for you?\n**This is a minigame item! When you would like to play, send the command `,use mistletoe`!**",
		async use(message) {
			let kissMessage = await message.channel.send("Who would you like to kiss?");
			const filter = m => m.author.id === message.author.id;

			const mentionMessage = (await message.channel.awaitMessages(filter, { max: 1, time: 120000 })).first();

			if (!mentionMessage) {
				await message.channel.send("You didn't answer in time! Please run the command again to try again.");
				return;
			}

			const kissedUsers = mentionMessage.mentions.users;

			if (kissedUsers.size > 1) {
				await message.channel.send("Please only mention one user!");
				return;
			} else if (kissedUsers.size === 0) {
				await message.channel.send("Please mention someone to kiss!");
				return;
			}

			const kissed = kissedUsers.first()!;

			if (kissed.id === message.author.id) {
				message.channel.send("You can't kiss yourself!");
				return;
			}

			await Promise.all([
				message.delete(),
				kissMessage.delete(),
				mentionMessage.delete()
			]);

			await message.channel.send(`${message.author} kissed ${kissed}! Congrats! (You both get 15 candy canes!)`);

			// TODO: transact
			await message.author.giveCandyCanes(15);
			await kissed.giveCandyCanes(15);

			const [ccAmt] = await message.client.knex("userData").select("candyCanes").where({ userID: message.author.id });
			const [kissedCCAmt] = await message.client.knex("userData").select("candyCanes").where({ userID: kissed.id });

			message.client.database.addLog(`${message.author.tag} (who now has ${ccAmt.candyCanes} candmentionMsgColly canes) used a mistletoe to kiss ${kissed.tag} (who now has ${kissedCCAmt.candyCanes} candy canes)`);
		}
	},
	{
		id: "meme",
		rank: 2,
		displayName: "Meme",
		response: "Nice! You found a fresh meme template! Time to rake in that sweet sweet intenet fame!\n**This is a minigame item! When you would like to play, send the command `,use meme`!**", //changed: reworded -Walrus
		async use(message) {
			const candyCanes = Math.floor(Math.random() * 41) - 10;
			await message.author.giveCandyCanes(candyCanes);

			const ccAmt = await message.author.fetchCandyCanes();

			await message.client.database.addLog(`${message.author.id} used a meme and got ${candyCanes} candy canes. They now have ${ccAmt} candy canes`);

			if (candyCanes === 0) {
				await message.channel.send("Well, looks like your meme got lost in new and nobody saw it.");
			} if (candyCanes < 0) {
				await message.channel.send("Wow, people did not like your meme! You lost " + -candyCanes + " candy canes! Welcome to controversial.");
			} if (candyCanes > 0 && candyCanes <= 15) {
				await message.channel.send("People liked your meme, which made it to hot! You gained " + candyCanes + " candy canes!");
			} if (candyCanes > 15) {
				await message.channel.send("People loved your meme, which made it to the top posts! You gained " + candyCanes + " candy canes!");
			}
		}
	},
	{
		id: "pin",
		rank: 2,
		worth: 16,
		displayName: "Pin",
		messageName: "a pin",
		response: "Nice! You found a Pin! And it's authentic! That's definitely going on your lanyard!" // changed: reworded -Walrus
	},
	{
		id: "blanket",
		rank: 2,
		worth: 15,
		displayName: "Blanket",
		messageName: "a blanket",
		response: "Nice! You found a blanket! You already feel yourself falling asleep in its soft, warm embrace!" // changed: reworded -Walrus
	},
	{
		id: "headphones",
		rank: 2,
		worth: 13,
		displayName: "Headphones",
		messageName: "a pair of headphones",
		response: "Nice! You found a pair of headphones! Time to rock the night away to your favorite tunes!" // changed: reworked -Walrus
	},
	{
		id: "game",
		rank: 2,
		worth: 19,
		displayName: "Video game",
		messageName: "a video game",
		response: "Nice! You found a video game! You've been eyeing this one for months, can't wait to give it a go!" // changed: reworded -Walrus
	},
	{
		id: "keyboard",
		rank: 2,
		displayName: "Keyboard",
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.knex("items")
				.insert({ name: "keyboard", userID: message.author.id, amount: 1, record: 1 })
				.onConflict("userID")
				.merge({
					amount: client.knex.raw("amount + 1"),
					record: client.knex.raw("GREATEST(amount, record)")
				});
			/*await client.database.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, ["keyboard", message.author.id]);*/
			const rand = Math.random();
			let prompt = "Nice! You found a keyboard! It's rattling with anticipation.\n**Type in the following for the keyboard to give you candy!** (Anyone can participate, but only the first person wins!)\n\n";
			let answer;

			if (rand < 1 / 10) {
				answer = "Snake? Snake?! SNAAAAKE!!";
			} else if (rand < 2 / 10) {
				answer = "You have died of dysentery";
			} else if (rand < 3 / 10) {
				answer = "You must construct additional pylons";
			} else if (rand < 4 / 10) {
				answer = "Cake, and grief counseling, will be available at the conclusion of the test";
			} else if (rand < 5 / 10) {
				answer = "Rise and shine, Mister Freeman. Rise and... shine";
			} else if (rand < 6 / 10) {
				answer = "Thank you Mario! But our Princess is in another castle!";
			} else if (rand < 7 / 10) {
				answer = "All your base are belong to us!";
			} else if (rand < 8 / 10) {
				answer = "We’ve both said a lot of things that you’re going to regret.";
			} else if (rand < 9 / 10) {
				answer = "I used to be an adventurer like you, until I took an arrow to the knee.";
			} else {
				answer = "Hey you, you're finally awake.";
			}
			prompt = prompt + answer
			const filter = response => response.content === answer;

			await message.channel.send(prompt);
			try {
				const collected = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
				const response = collected.first()!;

				await client.knex("userData").where({ userID: response.author.id }).increment("candyCanes", 20);
				await message.channel.send("<@" + response.author.id + "> was the first to type correctly and got 20 candy canes!");
			} catch {
				await message.channel.send("It looks like no one could amuse the keyboard this time. It somehow grew legs and walked away");
			}
		}
	},
	{
		id: "hat",
		rank: 3,
		worth: 35,
		displayName: "Santa's Hat",
		messageName: "santa's hat",
		response: "Wow! You found Santa's hat! He'll probably pay a fortune to get it back"
	},
	{
		id: "console",
		rank: 3,
		worth: 38,
		displayName: "Console",
		messageName: "a console",
		response: "Wow! You found a console! You've been wanting the SwitchU for forever now!" // changed: grammar -Walrus
	},
	{
		id: "computer",
		rank: 3,
		worth: 45,
		displayName: "Computer",
		messageName: "a computer",
		response: "Wow! You found a computer! It looks like it's going to be quite the upgrade!" // changed: reworked -Walrus
	},
	{
		id: "watch",
		rank: 3,
		displayName: "Watch",
		response: "Wow! You found a nice watch! It seems to need some tuning, though.\n**This is a minigame item! When you would like to play, send the command `,use watch`!**", // changed: reworded -Walrus
		async use(message) {
			message.client.minigamePlayers.add(message.author.id);
			let timeRed = (Math.floor(Math.random() * 9) + 2) * 1000;
			let seconds = 6;
			let stopMsg = await message.channel.send(`Click the 🛑 reaction as quickly as you can when the box turns green. Starting in ${seconds} seconds`);
			stopMsg.react("🛑");
			const timer = setInterval(async () => {
				seconds = seconds - 2;
				await stopMsg.edit(`Click the 🛑 reaction as quickly as you can when the box turns green. Starting in ${seconds} seconds`);
				if (seconds <= 0) {
					clearInterval(timer);
					await stopMsg.edit("🟥");
					const filter = (reaction, user) => {
						return reaction.emoji.name === "🛑" && user.id === message.author.id;
					};
					const redReaction = (await stopMsg.awaitReactions(filter, { max: 1, time: timeRed }));
					if (redReaction.size === 0) {
						await stopMsg.edit("🟩");
						let startGreen = new Date();
						const greenReaction = (await stopMsg.awaitReactions(filter, { max: 1, time: 8000 }));
						if (greenReaction.size === 0) {
							message.client.minigamePlayers.delete(message.author.id);
							message.client.database.removeItem({ itemName: "watch", userID: message.author.id });
							message.client.database.addLog(`${message.author.id} was too slow when using a watch`);
							stopMsg.edit("You were too slow! Click it as soon as it turns green next time.");
							return;
						} else {
							let endGreen = new Date();
							let timeToReact = endGreen.getTime() - startGreen.getTime();
							message.client.minigamePlayers.delete(message.author.id);
							message.client.database.removeItem({ itemName: "watch", userID: message.author.id });
							const toAdd = Math.floor(timeToReact >= 550 ? Math.max(5, 95 - (timeToReact / 10)) :
								timeToReact < 500 ? 60 : 50);
							message.author.giveCandyCanes(toAdd);
							const [ccAmt] = await message.client.knex("userData").select("candyCanes").where({ userID: message.author.id });
							message.client.database.addLog(`${message.author.id} took ${timeToReact} when using a watch and got ${toAdd} candy canes. They now have ${ccAmt.candyCanes} candy canes`);
							stopMsg.edit(`You took ${timeToReact} ms to react, so you got ${toAdd} candy canes!`);
							return;
						}
					} else {
						message.client.minigamePlayers.delete(message.author.id);
						message.client.database.removeItem({ itemName: "watch", userID: message.author.id });
						message.client.database.addLog(`${message.author.id} was too quick when using a watch`);
						stopMsg.edit("You were too quick! Wait for it to turn green next time.");
						return;
					}
				}
			}, 2000);
		}
	},
	{
		id: "mysteriousPart",
		rank: 3,
		displayName: "Mysterious Part",
		response: "Wow! You found a Mysterious Part! What could this be for?"
	},
	{
		id: "puppy",
		rank: 3,
		worth: 40,
		displayName: "Puppy",
		messageName: "a puppy (how cruel)",
		response: "Wow! You found a puppy! It certainly looks happy to see you, that box must've been dark and scary! Take good care of your new friend!" // changed: reworked -Walrus
	},
	{
		id: "sword",
		rank: 3,
		worth: 35,
		displayName: "Sword",
		messageName: "a sword",
		response: "Wow! You found a Sword! It looks pretty sharp, and you question its legality. Still freakin awesome though!" // changed: reworded -Walrus
	},
	{
		id: "simp",
		rank: 3,
		displayName: "Simp",
		response: "Wow! You found a simp! You're a little concerned that he snuck into your house, but hey, he'll pay you 50 candy canes to notice him. You take the money and promptly ignore him. Nice try buddy.", // changed: reworded, also what the fuck? -Walrus
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.knex("userData").where({ userID: message.author.id }).increment("candyCanes", 50);
			await client.knex("items")
				.insert({ name: "simp", userID: message.author.id, amount: 1, record: 1 })
				.onConflict("userID")
				.merge({
					amount: client.knex.raw("amount + 1"),
					record: client.knex.raw("GREATEST(amount, record)")
				});
			/*await client.database.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, ["simp", message.author.id]);*/
		}
	},
	{
		id: "cat",
		rank: 3,
		worth: 39,
		displayName: "Cat",
		messageName: "a cat (how cruel)",
		response: "Wow! You found a cat! It looks at you with indifference and goes back to sitting in the box. It's love at first sight!" // changed: reworded -Walrus
	},
	{
		id: "car",
		rank: 4,
		worth: 115,
		displayName: "Car",
		messageName: "a car",
		response: "No way! You found a car! You can't wait to take it for a spin!" // changed: reworked -Walrus
	},
	{
		id: "dragonEgg",
		rank: 4,
		displayName: "Dragon Egg",
		response: "No way! You found a dragon egg! Did it just wobble a little?\n**This is a minigame item! When you would like to play, send the command `,use dragonEgg`!**", //changed: NORBERT!! -Walrus
		onFind: async (client, message) => {
			let timestamp = Date.now();
			await client.knex("eggData")
				.insert({ userID: message.author.id, timeFound: String(timestamp), status: "UNCLAIMED" });
		},
		async use(message) {
			const itemCheck = await message.client.database.itemCheck({ userID: message.author.id, itemName: "dragonEgg" });
			if (itemCheck === null || itemCheck.amount < 1) {
				message.channel.send("You don't have any of that item!");
				return;
			}
			const eggData = await message.client.knex("eggData").first("*").where({ userID: message.author.id, status: "UNCLAIMED" });
			let eggAge = Date.now() - Number(eggData.timeFound);
			if (eggAge < 86400000) {
				let minsLeft = Math.floor((86400000 - eggAge) / 60000);
				let hoursLeft = Math.round(minsLeft / 60);
				minsLeft = minsLeft % 60;
				message.channel.send("The egg is still hatching! Please wait " + hoursLeft + " hours and " + minsLeft + " minutes.");
				return;
			} else if (eggAge < 172800000) {
				let eggCount = await message.client.knex("eggData")
					.count("eggID", { as: "eggCount" })
					.where({ userID: message.author.id, status: "UNCLAIMED" })
					.then(([{ eggCount }]) => eggCount as number);
				if (eggCount > 2) {
					message.channel.send("You hear an unsettling crack. You dragon egg has hatched! I hope you and your home are fire resistant. You have " + --eggCount + " eggs left unhatched!");
				} else if (eggCount === 2) {
					message.channel.send("You hear an unsettling crack. You dragon egg has hatched! I hope you and your home are fire resistant. You have 1 egg left unhatched!");
				} else {
					message.channel.send("You hear an unsettling crack. You dragon egg has hatched! I hope you and your home are fire resistant.");
				}
				await message.author.giveCandyCanes(150);
				await message.client.knex("eggData").where({ eggID: eggData.eggID }).update({ status: "CLAIMED" });
				await message.client.knex("items").where({ name: "dragonEgg", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
				const [ccAmt] = await message.client.knex("userData").select("candyCanes").where({ userID: message.author.id });
				message.client.database.addLog(`${message.author.id} hatched an egg successfully. They now have ${ccAmt} candy canes`);
				return;
			} else {
				message.client.database.addLog(`${message.author.id} killed a dragon`);
				message.channel.send("Sadly the egg has gone cold, and so has the life within. Well, at least you have breakfast!");
				await message.client.knex("eggData").where({ eggID: eggData.eggID }).update({ status: "LOST" });
				await message.client.knex("items").where({ name: "dragonEgg", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
			}
		}
	},
	{
		id: "role",
		rank: 4,
		displayName: "Role",
		response: "No way! You found a role! You feel special-er.\n**This item can be used in SMPEarth for an exclusive role (or candy canes if you already have the role). Please join the server and run `,use role` for your role. https://discord.gg/y5BfFjP**",
		async use(message) {
			const itemCheck = await message.client.database.itemCheck({ userID: message.author.id, itemName: "role" });
			if (itemCheck === null || itemCheck.amount < 1) {
				await message.channel.send("You don't have any of that item!");
				return;
			} if (message.guild!.id !== "647915068767338509") {
				await message.channel.send("Please send this command SMPEarth Discord to use this item. https://discord.gg/y5BfFjP");
				return;
			} if (message.member!.roles.cache.has("778022401858338846")) {
				const [ccAmt] = await message.client.knex("userData").select("candyCanes").where({ userID: message.author.id });
				await message.client.database.addLog(`${message.author.id} already had the role and got candy canes instead. They now have ${ccAmt} candy canes`);
				await message.channel.send("You already have the role, so take 150 candy canes instead!");
				await message.author.giveCandyCanes(150);
				await message.client.knex("items").where({ name: "role", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
				return;
			} else {
				await message.client.database.addLog(`${message.author.id} used the role`);
				await message.channel.send("Hey, you special snowflake. Take this exclusive role and keep being special.");
				await message.member!.roles.add("778022401858338846");
				await message.client.knex("items").where({ name: "role", userID: message.author.id }).decrement({ amount: 1 } as any, undefined as any);
				return;
			}
		}
		/*defaultBehavior: false,
		onFind: async (client, message) => {
			await client.knex("items")
				.insert({name: "role", userID: message.author.id, amount: 1, record: 1})
				.onConflict("userID")
				.merge({
						amount: client.knex.raw("amount + 1"),
						record: client.knex.raw("GREATEST(amount, record)")
			});
			/*await client.database.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, ["role", message.author.id]);
			// TODO: message.member.addRole("ROLE ID HERE");
		}*/
	},
	{
		id: "spanner",
		rank: 4,
		displayName: "Spanner",
		response: "No way! You found a spanner! It's like a wrench, but better! You can feel its magical powers flowing through it"
	},
	{
		id: "slime",
		rank: 4,
		displayName: "Slime",
		response: "No way! You found a slime! It's dark sky-blue and you can almost see a smiling face on it. It seems alive..."
	},
	{
		id: "dragon",
		rank: 4,
		displayName: "Dragon",
		response: "No way! You found a dragon! It looks like a wireframe dragon figure with raw power pulsing through it"
	},
	{
		id: "fractal",
		rank: 4,
		displayName: "Fractal",
		response: "No way! You found a fractal! It seems like a core to a magical symbol..."
	},
	/*{ Keep this commented pls
		id: "walrus",
		rank: -4,
		displayName: "Walrus",
		response: "Oh, you found a Wiggly Walrus. That really sucks man." // well that sucks
	},*/
	{
		id: "ownership",
		rank: 5,
		worth: 200,
		displayName: "Ownership",
		messageName: "the ownership of SMPEarth",
		response: "YOU CAN'T BELIEVE YOUR EYES! You found the ownership of SMPEarth! How does that even work?"
	},
	{
		id: "glitch",
		rank: 5,
		displayName: "Glitch",
		response: "ďګԎó۾űԺȮֲޙؒҰśǙĻԷˡސߡglitchŲҙӢٶۏŮȆɞٍͱ֧ϙԯڇĞ۠͌ąդ܌ͱۍ܃ِۓĒčޗךۛфĈۥݭվަխ۵υˁڞáʴ۶ߟʛאç˓ֶٮ ߉ȧӨގҗ̗ʰώʑʂ͏݅ǏݦޡʞڄáÔΝ֋**174candycanes**ϑ͘͢՞ݫőئȻéՃՑؼۓ̀Ϯ֡ЬӄĦĖɸ߸՘ݣЉާԦܠ¥ɆġȐƅϡȲڑԦԧטБ׸ʘ˩̣΍ޟѶĥщωͪн՝ޭ˾χ߶֑أ̍ÿޕ݁˛áݘÈؾܳӋȲۇݭ¾ɩޗѣ֚˝ӎݮ֐ؼҔĬ޳̟̍ԐҚэٛ֜ЗŮʮşҝދȤֲ̀҅ܧދݡܔω̋Ư֤΃̘ǎڷ۫ƈŶ߼ň֤֡͐Ħʠ֧ӯŲҙӢáʴ۶ߟʛאç",
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.knex("userData").where({ userID: message.author.id }).increment("candyCanes", 174);
			await client.knex("items")
				.insert({ name: "glitch", userID: message.author.id, amount: 1, record: 1 })
				.onConflict("userID")
				.merge({
					amount: client.knex.raw("amount + 1"),
					record: client.knex.raw("GREATEST(amount, record)")
				});
			/*await client.database.pool.execute(`
			INSERT INTO items (name, userID, amount, record) VALUES (?, ?, 1, 1)
			ON DUPLICATE KEY UPDATE
				amount = amount + 1,
				record = GREATEST(amount, record)
		`, ["glitch", message.author.id]);*/
			//wait client.database.foundAchievement({achName: findGlitch, userID: message.author.id, message: message})
		}
	},
	{
		id: "corn",
		rank: 5,
		worth: 0.5,
		displayName: "Corn",
		messageName: "the corn",
		response: "YOU CAN'T BELIEVE YOUR EYES! You found a cob of corn! THIS IS THE BEST PRESENT YOU COULD HAVE GOTTEN! You show it to your friends and they can't believe that you got corn! They're shocked and they go to tell their friends that you found the mythical corn. Eventually, the legend spreads everywhere and legends are made about the person who found the corn. You become the most popular person on Earth with nearly unlimited wealth because of the simps. Congrats, you won the game" // Why? Just why? -Walrus
	},
	{
		id: "dupeMachine",
		rank: 6,
		displayName: "Dupe Machine",
		response: "[placeholder]"
	},
	{
		id: "musicDisc",
		rank: 6,
		displayName: "Music Disc",
		response: "[placeholder]"
	},
	{
		id: "broken",
		rank: 6,
		displayName: "Broken Plane",
		response: "Come on devs! Y'all have one job!"
	},
	{
		id: "bigTriangle",
		rank: 6,
		displayName: "Big Triangle",
		response: "**What is happening? Your 3 mysterious parts, and fractal move together to form a weird looking 3D triangle shape. Once they are in position, the cyber dragon figurine awakens and upon seeing the parts, uses the slime and the spanner to secure the pieces into place. The object starts to glow and then floats up into the air. Congratulations, you've made the legendary Big Triangle!**"
	}
];
