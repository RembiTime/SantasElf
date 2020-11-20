import Knex from "knex";
import { Structures, Collection } from "discord.js";
import { AchievementEntry, achievements } from "../achievements";

declare module "discord.js" {
	interface User {
		ensureDB(transaction?: Knex): Promise<void>;

		/**
		 * Sets a boolean flag on a user
		 *
		 * @param flag the name of the flag to set
		 * @returns true if the flag was updated, false otherwise
		 */
		setFlag(flag: string, value: boolean): Promise<boolean>;
		getFlag(flag: string): Promise<boolean>;

		fetchAchievements(transaction?: Knex): Promise<Array<{ achievement: AchievementEntry, tiers: number[] }>>;
		givePresents(level: number, amount: number, transaction?: Knex): Promise<void>
	}
}

Structures.extend("User", OldUser =>
	class User extends OldUser {
		private _ensured = false;
		private _flags = new Set<string>();

		async setFlag(flag: string, value: boolean): Promise<boolean> {
			let previousValue = this._flags.has(flag);

			if (value) {
				this._flags.add(flag);
			} else {
				this._flags.delete(flag);
			}

			return previousValue !== value;
		}

		async getFlag(flag: string): Promise<boolean> {
			return this._flags.has(flag);
		}

		async ensureDB(transaction = this.client.knex) {
			if (this._ensured) { return; }

			await transaction("userData")
				.insert({ userID: this.id })
				.onConflict("userID").ignore();

			this._ensured = true;
		}

		async fetchAchievements(transaction = this.client.knex): Promise<Array<{ achievement: AchievementEntry, tiers: number[] }>> {
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
				// TODO: validate that achievement exists?
				achievement: achievements.find(achievement => achievement.id === id)!,
				tiers
			}));
		}

		async givePresents(level, amount, transaction = this.client.knex): Promise<void> {
			await this.ensureDB(transaction);

			await transaction("userData")
				.increment(`lvl${level}Presents`, amount)
				.where({ userID: this.id });
		}
	}
);
