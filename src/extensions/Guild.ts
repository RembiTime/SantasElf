import Knex from "knex";
import { Structures } from "discord.js";
import { GuildDataRow } from "../typings/tables";

declare module "discord.js" {
	interface Guild {
		ensureDB(transaction?: Knex): Promise<void>;
		fetchData(transaction?: Knex): Promise<GuildDataRow>;
		isPartner(transaction?: Knex): Promise<boolean>;
		setPartner(partner: boolean, transaction?: Knex);
		appealStatus(transaction?: Knex): Promise<"DENIED" | "ACCEPTED" | null>;
		setAppealStatus(status: "DENIED" | "ACCEPTED" | null, transaction?: Knex): Promise<void>;
	}
}

Structures.extend("Guild", OldGuild => class Guild extends OldGuild {
	private _ensured = false;

	async ensureDB(transaction = this.client.knex) {
		if (this._ensured) { return; }

		await transaction("guildData")
			.insert({ guildID: this.id })
			.onConflict("guildID").ignore();

		this._ensured = true;
	}

	async fetchData(transaction = this.client.knex) {
		await this.ensureDB(transaction);

		const guildData = await transaction("guildData")
			.first("*")
			.where({ guildID: this.id })
			.forUpdate();

		return guildData;
	}

	async isPartner(transaction = this.client.knex) {
		await this.ensureDB(transaction);

		const data = await transaction("guildData")
			.first("isPartner")
			.where({ guildID: this.id })
			.forUpdate();

		return data!.isPartner;
	}

	async setPartner(partner: boolean, transaction = this.client.knex) {
		await this.ensureDB(transaction);

		await transaction("guildData")
			.update({ isPartner: partner })
			.where({ guildID: this.id });
	}

	async appealStatus(transaction = this.client.knex): Promise<"DENIED" | "ACCEPTED" | null> {
		await this.ensureDB(transaction);

		const guildData = await transaction("guildData")
			.first("appealed3Deny")
			.where({ guildID: this.id })
			.forUpdate();

		// TODO: allow denying appeals
		return guildData!.appealed3Deny ? "ACCEPTED" : null;
	}

	async setAppealStatus(status: "DENIED" | "ACCEPTED" | null, transaction = this.client.knex) {
		await this.ensureDB(transaction);

		if (status === "DENIED") { throw new Error("DENIED appeal status not yet implemented"); }

		await transaction("guildData")
			.update({ appealed3Deny: status === "ACCEPTED" ? true : false })
			.where({ guildID: this.id });
	}
});
