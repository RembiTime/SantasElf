import { Structures, Collection } from "discord.js";

import { AchievementEntry, achievements } from "../achievements";


declare module "discord.js" {
	interface User {
		ensureDB(): Promise<void>;
		fetchAchievements(): Promise<Array<{ achievement: AchievementEntry, tiers: number[] }>>;
	}
}

Structures.extend("User", OldUser =>
	class User extends OldUser {
		private _ensured = false;

		async ensureDB() {
			if (this._ensured) { return; }

			await this.client.knex("userData")
				.insert({ userID: this.id })
				.onConflict("userID").ignore();

			this._ensured = true;
		}

		/**
		 * @returns {Promise<Array<{ achievement: import("../achievements").AchievementEntry, tiers: number[] }>>}
		 */
		async fetchAchievements(): Promise<any> {
			const achievementRows = await this.client.knex("achievements")
				.select("id", "tier")
				.where({ userID: this.id })
				.orderBy("tier");

			const achievementColl = new Collection<string, number[]>();

			for (const { id, tier } of achievementRows) {
				if (achievementColl.has(id)) {
					achievementColl.get(id).push(tier);
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
