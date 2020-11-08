const { Structures } = require("discord.js");

Structures.extend("Guild", OldGuild =>
	class Guild extends OldGuild {
		async ensureDB() {
			if (this._ensured) { return; }

			await this.client.knex("guildData")
				.insert({ guildID: this.id })
				.onConflict().ignore();

			this._ensured = true;
		}

		async getData() {
			await this.ensureDB();

			const [guildData] = await this.client.knex("guildData")
				.select("*")
				.where("guildID", "=", this.id);

			return guildData;
		}
	}
);
