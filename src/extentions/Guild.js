const { Structures } = require("discord.js");

Structures.extend("Guild", OldGuild =>
	class Guild extends OldGuild {
		async ensureDB() {
			await this.client.knex("guildData")
				.insert({ guildID: this.id })
				.onConflict().ignore();
		}
	}
);
