const { Structures } = require("discord.js");

Structures.extend("User", OldUser =>
	class User extends OldUser {
		async ensureDB() {
			if (this._ensured) { return; }

			await this.client.knex("userData")
				.insert({ userID: this.id })
				.onConflict().ignore();

			this._ensured = true;
		}
	}
);
