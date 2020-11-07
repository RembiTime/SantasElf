const { Structures } = require("discord.js");

Structures.extend("User", OldUser =>
	class User extends OldUser {
		async ensureDB() {
			await this.client.knex("userData")
				.insert({ userID: this.id })
				.onConflict().ignore();
		}
	}
);
