import Knex from "knex";
import { Structures, Collection } from "discord.js";
import { AchievementEntry, achievements } from "../achievements";

declare module "discord.js" {
	interface User {
		ensureDB(transaction?: Knex): Promise<void>;
		fetchAchievements(transaction?: Knex): Promise<Array<{ achievement: AchievementEntry, tiers: number[] }>>;
	}
}

Structures.extend("User", OldUser =>
	class User extends OldUser {
		private _ensured = false;

		async ensureDB(transaction = this.client.knex) {
			if (this._ensured) { return; }

			await transaction("userData")
				.insert({ userID: this.id })
				.onConflict("userID").ignore();

			this._ensured = true;
		}

		async fetchAchievements(transaction = this.client.knex): Promise<any> {
			const achievementRows = await transaction("achievements")
				.select("id", "tier")
				.where({ userID: this.id })
				.orderBy("tier")
				.forUpdate();

			const achievementColl = new Collection<string, number[]>();

			for (const { id, tier } of achievementRows) {
				if (achievementColl.has(id)) {
					achievementColl.get(id)!.push(tier);
				} else {
					achievementColl.set(id, [tier]);
				}
			}

			return achievementColl.map((tiers, id) => ({
				achievement: achievements.find(achievement => achievement.id === id),
				tiers
			}));
		}
	}
);
