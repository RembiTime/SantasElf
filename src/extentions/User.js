const { Structures } = require("discord.js");

Structures.extend("User", OldUser =>
	class User extends OldUser {
		async ensureDB() {
			if (this._ensured) { return; }

			/** @type {import("..").SantasElf} */
			this.client;

			await this.client.knex("userData")
				.insert({ userID: this.id })
				.onConflict("userID").ignore();

			this._ensured = true;
		}
	}
);
