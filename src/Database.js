const mysql = require("mysql2");
const items = require("./items");

class Database {
	constructor(options) {
		this.pool = mysql.createPool({ ...options, supportBigNumbers: true, bigNumberStrings: true }).promise();
	}

	async init() {
		await Promise.all([
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS presents (
					id            INTEGER AUTO_INCREMENT,
					code          VARCHAR(255)     NOT NULL,
					presentLevel  INTEGER          NOT NULL,
					timesFound    INTEGER          NOT NULL,
					guildID       BIGINT UNSIGNED  NOT NULL,
					channelID     BIGINT UNSIGNED  NOT NULL,
					hiddenByID    BIGINT UNSIGNED  NOT NULL,
					PRIMARY KEY(id)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS presents (
					id            INTEGER AUTO_INCREMENT,
					code          VARCHAR(255)     NOT NULL,
					presentLevel  INTEGER          NOT NULL,
					timesFound    INTEGER          NOT NULL,
					guildID       BIGINT UNSIGNED  NOT NULL,
					channelID     BIGINT UNSIGNED  NOT NULL,
					hiddenByID    BIGINT UNSIGNED  NOT NULL,
					PRIMARY KEY(id)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS userData (
					userID         BIGINT UNSIGNED,
					userName       VARCHAR(255)  NOT NULL,
					candyCanes     INTEGER       NOT NULL,
					wrongGuesses   INTEGER       NOT NULL,
					firstFinder    INTEGER       NOT NULL,
					totalPresents  INTEGER       NOT NULL,
					lvl1Presents   INTEGER       NOT NULL,
					lvl1Total      INTEGER       NOT NULL,
					lvl2Presents   INTEGER       NOT NULL,
					lvl2Total      INTEGER       NOT NULL,
					lvl3Presents   INTEGER       NOT NULL,
					lvl3Total      INTEGER       NOT NULL,
					lvl4Presents   INTEGER       NOT NULL,
					lvl4Total      INTEGER       NOT NULL,
					lvl5Presents   INTEGER       NOT NULL,
					lvl5Total      INTEGER       NOT NULL,
					coalAmt        INTEGER       NOT NULL,
					coalTotal      INTEGER       NOT NULL,
					treeAmt        INTEGER       NOT NULL,
					treeTotal      INTEGER       NOT NULL,
					paletteAmt     INTEGER       NOT NULL,
					paletteTotal   INTEGER       NOT NULL,
					ornamentAmt    INTEGER       NOT NULL,
					ornamentTotal  INTEGER       NOT NULL,
					hatAmt         INTEGER       NOT NULL,
					hatTotal       INTEGER       NOT NULL,
					mistletoeAmt   INTEGER       NOT NULL,
					mistletoeTotal INTEGER       NOT NULL,
					watchAmt       INTEGER       NOT NULL,
					watchTotal     INTEGER       NOT NULL,
					giftcardAmt    INTEGER       NOT NULL,
					giftcardTotal  INTEGER       NOT NULL,
					consoleAmt     INTEGER       NOT NULL,
					consoleTotal   INTEGER       NOT NULL,
					computerAmt    INTEGER       NOT NULL,
					computerTotal  INTEGER       NOT NULL,
					plushAmt       INTEGER       NOT NULL,
					plushTotal     INTEGER       NOT NULL,
					figurineAmt    INTEGER       NOT NULL,
					figurineTotal  INTEGER       NOT NULL,
					socksAmt       INTEGER       NOT NULL,
					socksTotal     INTEGER       NOT NULL,
					duckAmt        INTEGER       NOT NULL,
					duckTotal      INTEGER       NOT NULL,
					carAmt         INTEGER       NOT NULL,
					carTotal       INTEGER       NOT NULL,
					ownershipAmt   INTEGER       NOT NULL,
					ownershipTotal INTEGER       NOT NULL,
					memeAmt        INTEGER       NOT NULL,
					memeTotal      INTEGER       NOT NULL,
					glitchTotal    INTEGER       NOT NULL,
					pencilsAmt     INTEGER       NOT NULL,
					pencilsTotal   INTEGER       NOT NULL,
					snowglobeAmt   INTEGER       NOT NULL,
					snowglobeTotal INTEGER       NOT NULL,
					boxAmt         INTEGER       NOT NULL,
					boxTotal       INTEGER       NOT NULL,
					gooseTotal     INTEGER       NOT NULL,
					dragonEggAmt   INTEGER       NOT NULL,
					dragonEggTotal INTEGER       NOT NULL,
					mysteriousPart INTEGER       NOT NULL,
					roleTotal      INTEGER       NOT NULL,
					spannerAmt     INTEGER       NOT NULL,
					spannerTotal   INTEGER       NOT NULL,
					pumpkinAmt     INTEGER       NOT NULL,
					pumpkinTotal   INTEGER       NOT NULL,
					pinAmt         INTEGER       NOT NULL,
					pinTotal       INTEGER       NOT NULL,
					orangeAmt      INTEGER       NOT NULL,
					orangeTotal    INTEGER       NOT NULL,
					slimeAmt       INTEGER       NOT NULL,
					slimeTotal     INTEGER       NOT NULL,
					dirtAmt        INTEGER       NOT NULL,
					dirtTotal      INTEGER       NOT NULL,
					puppyAmt       INTEGER       NOT NULL,
					puppyTotal     INTEGER       NOT NULL,
					blanketAmt     INTEGER       NOT NULL,
					blanketTotal   INTEGER       NOT NULL,
					shirtAmt       INTEGER       NOT NULL,
					shirtTotal     INTEGER       NOT NULL,
					swordAmt       INTEGER       NOT NULL,
					swordTotal     INTEGER       NOT NULL,
					chocolateAmt   INTEGER       NOT NULL,
					chocolateTotal INTEGER       NOT NULL,
					cyberDragonAmt INTEGER       NOT NULL,
					cyberDragonTotal INTEGER     NOT NULL,
					headphonesAmt  INTEGER       NOT NULL,
					headphonesTotal INTEGER      NOT NULL,
					gameAmt        INTEGER       NOT NULL,
					gameTotal      INTEGER       NOT NULL,
					footballAmt    INTEGER       NOT NULL,
					footballTotal  INTEGER       NOT NULL,
					football2Amt   INTEGER       NOT NULL,
					football2Total INTEGER       NOT NULL,
					keyboardTotal  INTEGER       NOT NULL,
					cornAmt        INTEGER       NOT NULL,
					cornTotal      INTEGER       NOT NULL,
					simpTotal      INTEGER       NOT NULL,
					dupeAmt        INTEGER       NOT NULL,
					dupeTotal      INTEGER       NOT NULL,
					discAmt        INTEGER       NOT NULL,
					discTotal      INTEGER       NOT NULL,
					fractalAmt     INTEGER       NOT NULL,
					fractalTotal   INTEGER       NOT NULL,
					bigTriangleAmt INTEGER       NOT NULL,
					bigTriangleTotal INTEGER     NOT NULL,
					catAmt         INTEGER       NOT NULL,
					catTotal       INTEGER       NOT NULL,
					brokenPlaneAmt INTEGER       NOT NULL,
					brokenPlaneTotal INTEGER     NOT NULL,
					PRIMARY KEY(userID)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS foundPresents (
					id           INTEGER AUTO_INCREMENT,
					userID       BIGINT UNSIGNED  NOT NULL,
					userName     VARCHAR(255)     NOT NULL,
					presentCode  VARCHAR(255)     NOT NULL,
					PRIMARY KEY(id)
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS staffApproval (
					messageID     BIGINT UNSIGNED,
					status        ENUM('ONGOING', 'ACCEPTED', 'DENIED')  NOT NULL,
					claimedByID   BIGINT UNSIGNED,
					code          VARCHAR(255)     NOT NULL,
					presentLevel  INTEGER          NOT NULL,
					guildID       BIGINT UNSIGNED  NOT NULL,
					channelID     BIGINT UNSIGNED  NOT NULL,
					hiddenByID    BIGINT UNSIGNED  NOT NULL
				)
			`),
			this.pool.execute(`
				CREATE TABLE IF NOT EXISTS guildData (
					guildID	       BIGINT UNSIGNED  NOT NULL,
					isPartner      BOOLEAN          NOT NULL,
					appealed3Deny  BOOLEAN          NOT NULL
				)
			`)
		]);
	}

	async getPresent(options) {
		if ("id" in options) {
			const [results] = await this.pool.execute("SELECT * FROM presents WHERE id = ?", [options.id]);
			return results.length ? results[0] : null;
		} else if ("code" in options && "guildID" in options) {
			// TODO: Handle multiple presents with same code at different times in one guild?
			const [results] = await this.pool.execute("SELECT * FROM presents WHERE code = ? AND guildID = ?", [options.code, options.guildID]);
			return results.length ? results[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkNewGuild({ guildID }) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM guildData WHERE guildID = ?", [guildID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async checkIfPartner({ guildID }) {
		//yes, it's the exact same as above but with a different name :<
		const [results] = await this.pool.execute("SELECT * FROM guildData WHERE guildID = ?", [guildID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async checkStaffApprovalIDs(options) {
		if ("messageID" in options) {
			//Check if message is stored
			const [newGuild] = await this.pool.execute("SELECT * FROM staffApproval WHERE messageID = ?", [options.messageID]);
			return newGuild.length ? newGuild[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkApprovalIfOngoing(options) {
		if ("messageID" in options) {
			//Check if message is stored
			const [newGuild] = await this.pool.execute("SELECT * FROM staffApproval WHERE messageID = ? AND status = 'ONGOING'", [options.messageID]);
			return newGuild.length ? newGuild[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async checkOngoingIfCodeDupe(options) {
		if ("code" in options) {
			//Check if message is stored
			const [newGuild] = await this.pool.execute("SELECT * FROM staffApproval WHERE code = ? AND status = 'ONGOING'", [options.code]);
			return newGuild.length ? newGuild[0] : null;
		} else {
			throw new Error("Invalid getPresent() call");
		}
	}

	async findIfDupe(options) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM foundPresents WHERE userID = ? AND presentCode = ?", [options.userID, options.presentCode]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async userDataCheck(options) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM userData WHERE userID = ?", [options.userID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async findIfClaimedBy({ messageID }) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM staffApproval WHERE messageID = ?", [messageID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async findIfGuildExists({ guildID }) {
		//if ("id" in options) {
		const [results] = await this.pool.execute("SELECT * FROM guildData WHERE guildID = ?", [guildID]);
		return results.length ? results[0] : null;
		/*} else {
			throw new Error("Invalid findIfDupe() call");
		}*/
	}

	async addPresent({ code, presentLevel, timesFound, guildID, channelID, hiddenByID }) {
		await this.pool.execute(`
			INSERT INTO presents SET
				code = ?,
				presentLevel = ?,
				timesFound = ?,
				guildID = ?,
				channelID = ?,
				hiddenByID = ?
			`, [code, presentLevel, timesFound, guildID, channelID, hiddenByID]);
	}

	async presentFound({ userID, userName, presentCode }) {
		await this.pool.execute(`
			INSERT INTO foundPresents SET
				userID = ?,
				userName = ?,
				presentCode = ?
			`, [userID, userName, presentCode]);
	}

	async addNewUser({ userID, userName }) {
		await this.pool.execute(`
			INSERT INTO userData SET
				userID = ?,
				userName = ?,
				wrongGuesses = 0,
				firstFinder = 0,
				totalPresents = 0,
				lvl1Presents = 0,
				lvl2Presents = 0,
				lvl3Presents = 0,
				item1 = 0,
				item2 = 0,
				item3 = 0
			`, [userID, userName]);
	}

	async addStaffApprovalID({ messageID, status, code, presentLevel, guildID, channelID, hiddenByID }) {
		await this.pool.execute(`
			INSERT INTO staffApproval SET
				messageID = ?,
				status = ?,
				code = ?,
				presentLevel = ?,
				guildID = ?,
				channelID = ?,
				hiddenByID = ?
			`, [messageID, status, code, presentLevel, guildID, channelID, hiddenByID]);
	}

	async addNewGuild({ guildID, trueFalse }) {
		await this.pool.execute(`
			INSERT INTO guildData SET
				guildID = ?,
				isPartner = ?,
				appealed3Deny = FALSE
			`, [guildID, trueFalse]);
	}

	async notClaimed({ messageID }) {
		await this.pool.execute("UPDATE staffApproval SET claimedByID = NULL WHERE messageID = ?", [messageID]);
	}

	async claimedUpdate({ userID, messageID }) {
		await this.pool.execute("UPDATE staffApproval SET claimedByID = ? WHERE messageID = ?", [userID, messageID]);
	}

	async approvalStatusUpdate({ status, messageID }) {
		await this.pool.execute("UPDATE staffApproval SET status = ? WHERE messageID = ?", [status, messageID]);
	}

	async addPartner({ guildID }) {
		await this.pool.execute("UPDATE guildData SET isPartner = TRUE WHERE guildID = ?", [guildID]);
	}

	async changeLevel({ presentLevel, messageID }) {
		await this.pool.execute("UPDATE staffApproval SET presentLevel = ? WHERE messageID = ?", [presentLevel, messageID]);
	}

	async appealAccept({ guildID }) {
		await this.pool.execute("UPDATE guildData SET appealed3Deny = TRUE WHERE guildID = ?", [guildID]);
	}

	async getGlobalStats() {
		const [wrongGuesses, usersWithPresents, guildsWithPresents, presentsFound] = await Promise.all([
			this.getGlobalWrongGuesses(),
			this.getGlobalUsersWithPresents(),
			this.getGlobalGuildsWithPresents(),
			this.getGlobalPresentsFound()
		]);

		return { wrongGuesses, usersWithPresents, guildsWithPresents, presentsFound };
	}

	async getGlobalWrongGuesses() {
		const [[result]] = await this.pool.execute("SELECT SUM(wrongGuesses) FROM userData");
		return result;
	}

	async getGlobalUsersWithPresents() {
		const [[result]] = await this.pool.execute("SELECT COUNT(DISTINCT userID) FROM foundPresents");
		return result;
	}

	async getGlobalGuildsWithPresents() {
		const [[result]] = await this.pool.execute("SELECT COUNT(DISTINCT guildID) FROM presents");
		return result;
	}

	async getGlobalPresentsFound() {
		const [[result]] = await this.pool.execute("SELECT COUNT(DISTINCT presentCode) FROM foundPresents");
		return result;
	}

	async checkGuildDeniedAmount({ guildID }) {
		const [[result]] = await this.pool.execute("SELECT COUNT(*) AS count FROM staffApproval WHERE status = 'DENIED' AND guildID = ?", [guildID]);
		return result;
	}

	async checkIfPendingPresent({ guildID }) {
		const [[result]] = await this.pool.execute("SELECT COUNT(*) AS count FROM staffApproval WHERE status = 'ONGOING' AND guildID = ?", [guildID]);
		return result;
	}

	async checkPresentAmount({ guildID }) {
		const [[result]] = await this.pool.execute("SELECT COUNT(*) AS count FROM presents WHERE guildID = ?", [guildID]);
		return result;
	}



	//ITEM STUFF

	async addCandyCanes({ amount, userID }) {
		await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + ? WHERE userID = ?", [amount, userID]);
	}

	async addItem({ itemName, userID, presentLevel }) {
		let itemNameAmt = itemName + "Amt";
		let itemNameTotal = itemName + "Total";
		presentLevel = "lvl" + presentLevel + "Presents";
		await this.pool.execute("UPDATE userData SET ? = ? + 1 WHERE userID = ?", [itemNameAmt, itemNameAmt, userID]);
		await this.pool.execute("UPDATE userData SET ? = ? + 1 WHERE userID = ?", [itemNameTotal, itemNameTotal, userID]);
		await this.pool.execute("UPDATE userData SET ? = ? - 1 WHERE userID = ?", [presentLevel, presentLevel, userID]);
	}

	async foundGoose({ userID, presentLevel }) {
		let gooseTotal = "gooseTotal";
		presentLevel = "lvl" + presentLevel + "Presents";
		await this.pool.execute("UPDATE userData SET ? = ? + 1 WHERE userID = ?", [gooseTotal, gooseTotal, userID]);
		await this.pool.execute("UPDATE userData SET ? = ? - 1 WHERE userID = ?", [presentLevel, presentLevel, userID]);
		await this.pool.execute("UPDATE userData SET candyCanes = candyCanes - 20 WHERE userID = ?", [userID]);
	}

	async addItemSpecial({ itemName, userID, presentLevel}) {
		let itemNameTotal = itemName + "Total";
		presentLevel = "lvl" + presentLevel + "Presents";
		await this.pool.execute("UPDATE userData SET ? = ? + 1 WHERE userID = ?", [itemNameTotal, itemNameTotal, userID]);
		await this.pool.execute("UPDATE userData SET ? = ? - 1 WHERE userID = ?", [presentLevel, presentLevel, userID]);
	}

	async foundKeyboard({ message }) {
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
		const collected = await message.channel.awaitMessages(filter, {max: 1, time: 30000, errors: ["time"]}).catch(() => message.channel.send("It looks like no one could amuse the keyboard this time. It somehow grew legs and walked away"));
		await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + 20 WHERE userID = ?", [collected.first().author.id]);
	}

	async foundSimp({ userID }) {
		await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + 50 WHERE userID = ?", [userID]);
	}

	async foundGlitch({ userID }) {
		await this.pool.execute("UPDATE userData SET candyCanes = candyCanes + 174 WHERE userID = ?", [userID]);
	}

	async addBigTriangle({ userID }) {
		let bigTriangleAmt = "bigTriangleAmt";
		let bigTriangleTotal = "bigTriangleTotal";
		await this.pool.execute("UPDATE userData SET ? = ? + 1 WHERE userID = ?", [bigTriangleAmt, bigTriangleAmt, userID]);
		await this.pool.execute("UPDATE userData SET ? = ? + 1 WHERE userID = ?", [bigTriangleTotal, bigTriangleTotal, userID]);
	}

	async checkBigTriangle({ userID, message }) {
		const userData = await this.client.database.userDataCheck({ userID: userID });
		if (userData.mysteriousPartAmt >= 3 && userData.fractal >= 1 && userData.spanner >= 1 && userData.slime >= 1 && userData.cyberDragon >= 1) {
			this.client.database.addBigTriangle({ userID: userID });
			message.channel.send("**What is happening? Your 3 mysterious parts, and fractal move together to form a weird looking 3D triangle shape. Once they are in position, the cyber dragon figurine awakens and upon seeing the parts, uses the slime and the spanner to secure the pieces into place. The object starts to glow and then floats up into the air. Congratulations, you've made the legendary Big Triangle!**");
		}
	}

	async generateRarity({ presentLevel }) {
		// Rows are weights for present ranks for different present levels
		const weights = [
			[10, 45, 25, 15,  4,  1],
			[10, 35, 25, 20,  8,  2],
			[10, 25, 25, 25, 12,  3],
			[10, 15, 20, 30, 20,  5],
			[10, 10, 15, 20, 30, 15]
		][presentLevel + 1];

		let num = Math.floor(Math.random() * 100) + 1;
		for (let i = 0; i < weights; i++) {
			num -= weights[i];
			if (num <= 0) {
				return i;
			}
		}

		throw new Error("This should never be executed");
	}

	async choosePresent({ message, presentLevel, userID }) {
		const presentRarity = this.client.database.generateRarity({ presentLevel });
		const rand = Math.random();
		if (presentRarity == 0) {
			if (rand < 1 / 3) {
				this.client.database.addItem({ itemName: "coal", userID: userID, presentLevel: presentLevel });
				message.channel.send("Uh oh... Looks like you got on the naughty list. You found coal");
			} else if (rand < 2 / 3) {
				this.client.database.foundGoose({ userID: userID, presentLevel: presentLevel });
				message.channel.send("Honk honk! The present is torn open and out pops a very naughty goose! In your bewilderment, it stole 20 of your candy canes!");
			} else {
				this.client.database.addItem({ itemName: "dirt", userID: userID, presentLevel: presentLevel });
				message.channel.send("You open the present to find dirt... fun");
			}
		} if (presentRarity == 1) {
			if (rand < 1 / 12) {
				this.client.database.addItem({ itemName: "ornament", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found an ornament! That doesn't really do you much good since you've already decorated your tree though");
			} else if (rand < 2 / 12) {
				this.client.database.addItem({ itemName: "plush", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a stuffed animal! It isn't worth much, but it makes a good companion.");
			} else if (rand < 3 / 12) {
				this.client.database.addItem({ itemName: "socks", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a pair of socks! Why do people keep giving me socks as a gift??");
			} else if (rand < 4 / 12) {
				this.client.database.addItem({ itemName: "duck", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a rubber duck! Although it's a cheap plastic toy, you know that you still love rubber ducks");
			} else if (rand < 5 / 12) {
				this.client.database.addItem({ itemName: "pencils", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a box of pencils! Why would I want pencils as a gift?");
			} else if (rand < 6 / 12) {
				this.client.database.addItem({ itemName: "box", userID: userID, presentLevel: presentLevel });
				message.channel.send("You open the present to find a cardboard box! You feel compelled to go into it");
			} else if (rand < 7 / 12) {
				this.client.database.addItem({ itemName: "pumpkin", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a pumpkin! It's starting to rot because someone thought it would be funny to give you their Halloween pumpkin");
			} else if (rand < 8 / 12) {
				this.client.database.addItem({ itemName: "orange", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found an orange! Why do people put fruit in a present? I'll never understand");
			} else if (rand < 9 / 12) {
				this.client.database.addItem({ itemName: "shirt", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a shirt! Great, more clothes");
			} else if (rand < 10 / 12) {
				this.client.database.addItem({ itemName: "chocolate", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a box of chocolate! What is this, Valentine's day?");
			} else if (rand < 11 / 12) {
				this.client.database.addItem({ itemName: "football", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a football! Which football is this, though?");
			} else {
				this.client.database.addItem({ itemName: "football2", userID: userID, presentLevel: presentLevel });
				message.channel.send("You found a football! Which football is this, though?");
			}
		} if (presentRarity == 2) {
			if (rand < 1 / 12) {
				this.client.database.addItem({ itemName: "tree", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found an entire tree! How did they even fit this into the present?");
			} else if (rand < 2 / 12) {
				this.client.database.addItem({ itemName: "giftcard", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a giftcard! It's worth 20 candy canes!");
			} else if (rand < 3 / 12) {
				this.client.database.addItem({ itemName: "figurine", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a figurine! Time to add that to your collection!");
			} else if (rand < 4 / 12) {
				this.client.database.addItem({ itemName: "snowglobe", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a snowglobe! You love shaking it and seeing the snow fly around everywhere!");
			} else if (rand < 5 / 12) {
				this.client.database.addItem({ itemName: "palette", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found an art palette! There's so many different colors to paint with!\n**This is a minigame item! When you would like to play, send the command `,use palette`!**");
			} else if (rand < 6 / 12) {
				this.client.database.addItem({ itemName: "mistletoe", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found some mistletoe! Who would've left this for you?\n**This is a minigame item! When you would like to play, send the command `,use mistletoe`!**");
			} else if (rand < 7 / 12) {
				this.client.database.addItem({ itemName: "meme", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a fresh meme template! You really want to try it out on your favorite social media site and get some intenet fame!\n**This is a minigame item! When you would like to play, send the command `,use meme`!**");
			} else if (rand < 8 / 12) {
				this.client.database.addItem({ itemName: "pin", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a Pin! It's also authentic! Time to add it to your lanyard!");
			} else if (rand < 9 / 12) {
				this.client.database.addItem({ itemName: "blanket", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a blanket! This will keep you warm throughout the rest of winter!");
			} else if (rand < 10 / 12) {
				this.client.database.addItem({ itemName: "headphones", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a pair of headphones! They're pretty nice quality, and you're excited to try it out!");
			} else if (rand < 11 / 12) {
				this.client.database.addItem({ itemName: "game", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a video game! You've been wanting this game for a while and want to start playing it immediately!");
			} else {
				this.client.database.addItemSpecial({ itemName: "keyboard", userID: userID, presentLevel: presentLevel });
				message.channel.send("Nice! You found a keyboard! It seems to be rattling with anticipation");
				this.client.database.foundKeyboard({ message: message });
			}
		} if (presentRarity == 3) {
			if (rand < 1 / 9) {
				this.client.database.addItem({ itemName: "hat", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found Santa's hat! He'll probably pay a fortune to get it back");
			} else if (rand < 2 / 9) {
				this.client.database.addItem({ itemName: "console", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found a console! You've been wanting the SwitchU forever now!");
			} else if (rand < 3 / 9) {
				this.client.database.addItem({ itemName: "computer", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found a computer! Now people can't judge you for being a Mac gamer!");
			} else if (rand < 4 / 9) {
				this.client.database.addItem({ itemName: "watch", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found a nice-looking watch! It seems to need some tuning, though.\n**This is a minigame item! When you would like to play, send the command `,use watch`!**");
			} else if (rand < 5 / 9) {
				this.client.database.addItem({ itemName: "mysteriousPart", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found a Mysterious Part! What could this be for?");

				this.client.database.checkBigTriangle({ userID: message.author.id, message: message });
			} else if (rand < 6 / 9) {
				this.client.database.addItem({ itemName: "puppy", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found a puppy! It jumps out and immediately starts licking your face! A puppy in a box just seems cruel, but you're too overjoyed to finally get a puppy to worry about it!");
			} else if (rand < 7 / 9) {
				this.client.database.addItem({ itemName: "sword", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found a Sword! You wonder how it didn't cut the box open and if this is legal, but it's still really cool");
			} else if (rand < 8 / 9) {
				this.client.database.addItemSpecial({ itemName: "simp", userID: userID, presentLevel: presentLevel });
				this.client.database.foundSimp({ userID: userID });
				message.channel.send("Wow! You found a simp! You wonder why it was hiding in the box, but he gives you 50 candy canes hoping that you will notice it. You take the money and promptly ignore it");
			} else {
				this.client.database.addItem({ itemName: "cat", userID: userID, presentLevel: presentLevel });
				message.channel.send("Wow! You found a cat! You wonder if this is just a present for you or if it trapped itself inside a box and you thought it was a present. Nevertheless, it's your's now.");
			}
		} if (presentRarity == 4) {
			if (rand < 1 / 7) {
				this.client.database.addItem({ itemName: "car", userID: userID, presentLevel: presentLevel });
				message.channel.send("WHA?? You found a car! You don't know how you didn't see this before, but you're ecsatic.");
			} else if (rand < 2 / 7) {
				this.client.database.addItem({ itemName: "dragonEgg", userID: userID, presentLevel: presentLevel });
				message.channel.send("WHA?? You found a dragon egg! You wonder if it will hatch\n**This is a minigame item! When you would like to play, send the command `,use dragonEgg`!**");
			} else if (rand < 3 / 7) {
				this.client.database.addItemSpecial({ itemName: "role", userID: userID, presentLevel: presentLevel });
				message.channel.send("WHA?? You found a role! You feel special-er");
				message.member.addRole("ROLE ID HERE");
			} else if (rand < 4 / 7) {
				this.client.database.addItem({ itemName: "spanner", userID: userID, presentLevel: presentLevel });
				message.channel.send("WHA?? You found a spanner! It's like a wrench, but better! You can feel its magical powers flowing through it");

				this.client.database.checkBigTriangle({ userID: message.author.id, message: message });
			} else if (rand < 5 / 7) {
				this.client.database.addItem({ itemName: "slime", userID: userID, presentLevel: presentLevel });
				message.channel.send("WHA?? You found a slime! It's dark sky-blue and you can almost see a smiling face on it. It seems alive...");

				this.client.database.checkBigTriangle({ userID: message.author.id, message: message });
			} else if (rand < 6 / 7) {
				this.client.database.addItem({ itemName: "cyberDragon", userID: userID, presentLevel: presentLevel });
				message.channel.send("WHA?? You found a cyber dragon! It looks like a wireframe dragon figure with raw power pulsing through it");

				this.client.database.checkBigTriangle({ userID: message.author.id, message: message });
			} else {
				this.client.database.addItem({ itemName: "fractal", userID: userID, presentLevel: presentLevel });
				message.channel.send("WHA?? You found a fractal! It seems like a core to a magical symbol...");

				this.client.database.checkBigTriangle({ userID: message.author.id, message: message });
			}
		} if (presentRarity == 5) {
			if (rand < 1 / 3) {
				this.client.database.addItem({ itemName: "ownership", userID: userID, presentLevel: presentLevel });
				message.channel.send("YOU CAN'T BELIEVE YOUR EYES! You found the ownership of SMPEarth! How does that even work?");
			} else if (rand < 2 / 3) {
				this.client.database.addItemSpecial({ itemName: "glitch", userID: userID, presentLevel: presentLevel });
				this.client.database.foundGlitch({ userID: userID });
				message.channel.send("YOU CAN'T BELIEVE YOUR EYES! You found a glitch! WHAT IS HAPPENING? YOU GOT 174 candy canes!");
				//Make that text look glitchy
			} else {
				this.client.database.addItem({ itemName: "corn", userID: userID, presentLevel: presentLevel });
				message.channel.send("YOU CAN'T BELIEVE YOUR EYES! You found a cob of corn! THIS IS THE BEST PRESENT YOU COULD HAVE GOTTEN! You show it to your friends and they can't believe that you got corn! They're shocked and they go to tell their friends that you found the mythical corn. Eventually, the legend spreads everywhere and legends are made about the person who found the corn. You become the most popular person on Earth with nearly unlimited wealth because of the simps. Congrats, you won the game");
			}
		}
	}

		// TODO: handle special items
		await this.addItem({ itemName: item.id, userID, presentLevel });
		await message.channel.send(item.response);
	}
}

module.exports = Database;
