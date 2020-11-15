const { Structures, Collection } = require("discord.js");

const achievements = require("../achievements");

Structures.extend("User", OldUser =>
	class User extends OldUser {
		async ensureDB() {
			if (this._ensured) { return; }

			await this.client.knex("userData")
				.insert({ userID: this.id })
				.onConflict("userID").ignore();

			this._ensured = true;
		}

		/**
		 * @returns {Array<{ achivement: import("../achievements").AchievementEntry, tiers: number[] }>}
		 */
		async fetchAchievements() {
			const achievementRows = await this.client.knex("achievements")
				.fetch("id", "tier")
				.where({ userID: this.id })
				.orderBy("tier");

			const achievementColl = new Collection();

			for (const { id, tier } of achievementRows) {
				if (achievementColl.has(id)) {
					achievementColl.get(id).push(tier);
				} else {
					achievementColl.set(id, [tier]);
				}
			}

			return achievementColl.map((id, tiers) => ({
				achievement: achievements.find(achievement => achievement.id === id),
				tiers
			}));
		}
	}
);
