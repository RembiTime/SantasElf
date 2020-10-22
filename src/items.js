// TODO: make handlers atomic
// TODO: handle present level updates

/**
 * @typedef {object} ItemEntry
 * @property {string} id
 * @property {number} rank
 * @property {displayName} displayName
 * @property {displayName} response
 * @property {boolean} defaultBehavior
 * @property {OnFindType} onFind
 */

/**
  * @callback OnFindType
  * @param client
  * @param message
  * @returns {Promise<void>}
  */

/**
 * @type {ItemEntry[]}
 */
module.exports = [
	{
		id: "coal",
		rank: 0,
		worth: 0,
		displayName: "Coal",
		response: "Uh oh... Looks like you got on the naughty list. You found coal."
	},
	{
		id: "goose",
		rank: 0,
		displayName: "Goose",
		response: "Honk! The present is torn open and out pops a very naughty goose! In your bewilderment, it stole 20 of your candy canes",
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.database.pool.execute("UPDATE userData SET gooseTotal = gooseTotal + 1 WHERE userID = ?", [message.author.id]);
			await client.database.pool.execute("UPDATE userData SET candyCanes = candyCanes - 20 WHERE userID = ?", [message.author.id]);
		}
	},
	{
		id: "dirt",
		rank: 0,
		worth: 0,
		displayName: "Dirt",
		response: "You open the present to find dirt... fun." //changed: punctuation -Walrus
	},
	{
		id: "ornament",
		rank: 1,
		worth: 5,
		displayName: "Ornament",
		response: "You found an ornament! That doesn't really do you much good since you've already decorated your tree." //changed: reworded -Walrus
	},
	{
		id: "plush",
		rank: 1,
		worth: 8,
		displayName: "Plush",
		response: "You found a stuffed animal! It isn't worth much, but it makes a good companion."
	},
	{
		id: "socks",
		rank: 1,
		worth: 2,
		displayName: "Socks",
		response: "You found a pair of socks! Why do people always give me socks?" //changed: reworded -Walrus
	},
	{
		id: "duck",
		rank: 1,
		worth: 4,
		displayName: "Rubber Duck",
		response: "You found a rubber duck! Cheap plastic has never been so lovable! You will cherish your new friend forever." //changed: reworded -Walrus
	},
	{
		id: "pencils",
		rank: 1,
		worth: 3,
		displayName: "Pencils",
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
		response: "You found a pumpkin! Blech! It smells like it's been in there since Halloween." //changed: reworded -Walrus
	},
	{
		id: "orange",
		rank: 1,
		worth: 3,
		displayName: "Orange",
		response: "You found an orange! Why did someone feel the need to give you this? You take a minute to contemplate the subtle intricacies of human interaction." //changed highbrow humor aquired -Walrus
	},
	{
		id: "shirt",
		rank: 1,
		worth: 6,
		displayName: "Shirt",
		response: "You found a shirt! Great, more clothes. At least its clean." //changed: added a bit -Walrus
	},
	{
		id: "chocolate",
		rank: 1,
		worth: 7,
		displayName: "Chocolate",
		response: "You found a box of chocolate! Well, that's Valentine's day sorted!" //changed: reworked -Walrus
	},
	{
		id: "football",
		rank: 1,
		worth: 6,
		displayName: "Football",
		response: "You found a football! Which football is it, though?" //changed: Grammar -Walrus
	},
	{
		id: "football2",
		rank: 1,
		worth: 6,
		displayName: "Football2",
		response: "You found a football! Which football is it, though?" //changed: Grammar -Walrus
	},
	{
		id: "singleCandy",
		rank: 1,
		displayName: "singleCandy",
		response: "You found a singular candy cane! Make sure not to spend it all in one place!", // changed: reworded, also what the fuck? -Walrus
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.database.pool.execute("UPDATE userData SET candyCanes = candyCanes + 1 WHERE userID = ?", [message.author.id]);
			await client.database.pool.execute("UPDATE userData SET singleCandyTotal = singleCandyTotal + 1 WHERE userID = ?", [message.author.id]);
		}
	},
	{
		id: "tree",
		rank: 2,
		worth: 13,
		displayName: "Tree",
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
		response: "Nice! You found a figurine! A fine addition to your collection." //changed: prequelmeme -Walrus
	},
	{
		id: "snowglobe",
		rank: 2,
		worth: 15,
		displayName: "Snowglobe",
		response: "Nice! You found a snowglobe! It's a winter wonderland on the go!" //changed: reworked -Walrus
	},
	{
		id: "palette",
		rank: 2,
		displayName: "Palette",
		response: "Nice! You found an paint palette! Time to make some happy little trees!\n**This is a minigame item! When you would like to play, send the command `,use palette`!**" //changed: Bob Ross -Walrus
	},
	{
		id: "mistletoe",
		rank: 2,
		displayName: "Mistletoe",
		response: "Nice! You found some mistletoe! Who would've left this for you?\n**This is a minigame item! When you would like to play, send the command `,use mistletoe`!**"
	},
	{
		id: "meme",
		rank: 2,
		displayName: "Meme",
		response: "Nice! You found a fresh meme template! Time to rake in that sweet sweet intenet fame!\n**This is a minigame item! When you would like to play, send the command `,use meme`!**" //changed: reworded -Walrus
	},
	{
		id: "pin",
		rank: 2,
		worth: 16,
		displayName: "Pin",
		response: "Nice! You found a Pin! And it's authentic! That's definitely going on your lanyard!" // changed: reworded -Walrus
	},
	{
		id: "blanket",
		rank: 2,
		worth: 15,
		displayName: "Blanket",
		response: "Nice! You found a blanket! You already feel yourself falling asleep in its soft, warm embrace!" // changed: reworded -Walrus
	},
	{
		id: "headphones",
		rank: 2,
		worth: 13,
		displayName: "Headphones",
		response: "Nice! You found a pair of headphones! Time to rock the night away to your favorite tunes!" // changed: reworked -Walrus
	},
	{
		id: "game",
		rank: 2,
		worth: 19,
		displayName: "Video game",
		response: "Nice! You found a video game! You've been eyeing this one for months, can't wait to give it a go!" // changed: reworded -Walrus
	},
	{
		id: "keyboard",
		rank: 2,
		displayName: "Keyboard",
		response: "Nice! You found a keyboard! It's rattling with anticipation", // changed: reworded -Walrus
		defaultBehavior: false,
		onFind: async (client, message) => {

			await client.database.pool.execute("UPDATE userData SET keyboardTotal = keyboardTotal + 1 WHERE userID = ?", [message.author.id]);
			const rand = Math.random();
			let prompt = "Type in the following for the keyboard to give you candy!\n\n";
			if (rand < 1 / 3) {
				prompt = prompt + "This is an example typing test";
			} else if (rand < 2 / 3) {
				prompt = prompt + "This is another example of a prompt";
			} else {
				prompt = prompt + "I've run out of ideas";
			}
			const filter = response => response.content === prompt;

			message.channel.send(prompt);
			const collected = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] }).catch(() => message.channel.send("It looks like no one could amuse the keyboard this time. It somehow grew legs and walked away"));
			await client.database.pool.execute("UPDATE userData SET candyCanes = candyCanes + 20 WHERE userID = ?", [collected.first().author.id]);
		}
	},
	{
		id: "hat",
		rank: 3,
		worth: 35,
		displayName: "Santa's Hat",
		response: "Wow! You found Santa's hat! He'll probably pay a fortune to get it back"
	},
	{
		id: "console",
		rank: 3,
		worth: 38,
		displayName: "Console",
		response: "Wow! You found a console! You've been wanting the SwitchU for forever now!" // changed: grammar -Walrus
	},
	{
		id: "computer",
		rank: 3,
		worth: 45,
		displayName: "Computer",
		response: "Wow! You found a computer! It looks like it's going to be quite the upgrade!" // changed: reworked -Walrus
	},
	{
		id: "watch",
		rank: 3,
		displayName: "Watch",
		response: "Wow! You found a nice watch! It seems to need some tuning, though.\n**This is a minigame item! When you would like to play, send the command `,use watch`!**" // changed: reworded -Walrus
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
		response: "Wow! You found a puppy! It certainly looks happy to see you, that box must've been dark and scary! Take good care of your new friend!" // changed: reworked -Walrus
	},
	{
		id: "sword",
		rank: 3,
		worth: 35,
		displayName: "Sword",
		response: "Wow! You found a Sword! It looks pretty sharp, and you question its legality. Still freakin awesome though!" // changed: reworded -Walrus
	},
	{
		id: "simp",
		rank: 3,
		displayName: "Simp",
		response: "Wow! You found a simp! You're a little concerned that he snuck into your house, but hey, he'll pay you 50 candy canes to notice him. You take the money and promptly ignore him. Nice try buddy.", // changed: reworded, also what the fuck? -Walrus
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.database.pool.execute("UPDATE userData SET candyCanes = candyCanes + 50 WHERE userID = ?", [message.author.id]);
			await client.database.pool.execute("UPDATE userData SET simpTotal = simpTotal + 1 WHERE userID = ?", [message.author.id]);
		}
	},
	{
		id: "cat",
		rank: 3,
		worth: 39,
		displayName: "Cat",
		response: "Wow! You found a cat! It looks at you with indifference and goes back to sitting in the box. It's love at first sight!" // changed: reworded -Walrus
	},
	{
		id: "car",
		rank: 4,
		worth: 115,
		displayName: "Car",
		response: "WHA?? You found a car! You can't wait to take it for a spin!" // changed: reworked -Walrus
	},
	{
		id: "dragonEgg",
		rank: 4,
		displayName: "Dragon Egg",
		response: "WHA?? You found a dragon egg! Did it just wobble a little?\n**This is a minigame item! When you would like to play, send the command `,use dragonEgg`!**" //changed: NORBERT!! -Walrus
	},
	{
		id: "role",
		rank: 4,
		displayName: "Role",
		response: "WHA?? You found a role! You feel special-er.",
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.database.pool.execute("UPDATE userData SET roleTotal = roleTotal + 1 WHERE userID = ?", [message.author.id]);
			// TODO: message.member.addRole("ROLE ID HERE");
		}
	},
	{
		id: "spanner",
		rank: 4,
		displayName: "Spanner",
		response: "WHA?? You found a spanner! It's like a wrench, but better! You can feel its magical powers flowing through it"
	},
	{
		id: "slime",
		rank: 4,
		displayName: "Slime",
		response: "WHA?? You found a slime! It's dark sky-blue and you can almost see a smiling face on it. It seems alive..."
	},
	{
		id: "dragon",
		rank: 4,
		displayName: "Dragon",
		response: "WHA?? You found a dragon! It looks like a wireframe dragon figure with raw power pulsing through it"
	},
	{
		id: "fractal",
		rank: 4,
		displayName: "Fractal",
		response: "WHA?? You found a fractal! It seems like a core to a magical symbol..."
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
		response: "YOU CAN'T BELIEVE YOUR EYES! You found the ownership of SMPEarth! How does that even work?"
	},
	{
		id: "glitch",
		rank: 5,
		displayName: "Glitch",
		response: "YOU CAN'T BELIEVE YOUR EYES! You found a glitch! WHAT IS HAPPENING? YOU GOT 174 candy canes!",
		defaultBehavior: false,
		onFind: async (client, message) => {
			await client.database.pool.execute("UPDATE userData SET candyCanes = candyCanes + 174 WHERE userID = ?", [message.author.id]);
			await client.database.pool.execute("UPDATE userData SET glitchTotal = glitchTotal + 1 WHERE userID = ?", [message.author.id]);
		}
	},
	{
		id: "corn",
		rank: 5,
		worth: 0.5,
		displayName: "Corn",
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
