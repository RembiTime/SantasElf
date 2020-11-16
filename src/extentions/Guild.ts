import { Structures } from "discord.js";
import { GuildDataRow } from "../Database";

declare module "discord.js" {
	interface Guild {
		ensureDB(): Promise<void>;
		fetchData(): Promise<GuildDataRow>;
	}
}

Structures.extend("Guild", OldGuild =>
	class Guild extends OldGuild {
		private _ensured = false;

		async ensureDB() {
			if (this._ensured) { return; }

			await this.client.knex("guildData")
				.insert({ guildID: this.id })
				.onConflict("guildID").ignore();

			this._ensured = true;
		}

		async fetchData() {
			await this.ensureDB();

			const [guildData] = await this.client.knex("guildData")
				.select("*")
				.where({ guildID : this.id });

			return guildData;
		}
	}
);
