import Knex from "knex";
import { Structures, Collection } from "discord.js";
import { AchievementEntry, achievements } from "../achievements";
import { Item, items } from "../items";
import { UserDataRow } from "../typings/tables";

const itemMap = new Map(items.map(item => [item.id, item]));

type UserItem = { item: Item, amount: number, record: number };

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
		fetchData(transaction?: Knex): Promise<UserDataRow>;

		fetchItems(transaction?: Knex): Promise<UserItem[]>;
		fetchItem(item: Item | string, transaction?: Knex): Promise<UserItem | null>;
		giveItem(item: Item | string, transaction?: Knex): Promise<void>;
		removeItem(item: Item | string, transaction?: Knex): Promise<void>;

		giveCandyCanes(amount: number, transaction?: Knex): Promise<void>;

		givePresents(level: number, amount: number, transaction?: Knex): Promise<void>;
		/** @returns true if the presents were successfully removed, false if there were not enough presents in the inventory to take */
		removePresents(level: number, amount: number, transaction?: Knex): Promise<boolean>;
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

		async fetchData(transaction = this.client.knex): Promise<UserDataRow> {
			return transaction("userData")
				.first("*")
				.where({ userID: this.id })
				.forUpdate();
		}

		async fetchItems(transaction = this.client.knex): Promise<Array<{ item: Item, amount: number, record: number }>> {
			const results = await transaction("items")
				.select("name", "amount", "record")
				.from("items")
				.where({ userID: this.id })
				.forUpdate();


			return results.map(({ name, amount, record }) => ({
				item: itemMap.get(name)!,
				amount,
				record
			}));
		}

		async fetchItem(item: Item | string, transaction = this.client.knex) {
			const result = await transaction("items")
				.first("name", "amount", "record")
				.from("items")
				.where({
					name: typeof item === "string" ? item : item.id,
					userID: this.id })
				.forUpdate();

			return result ? {
				item: itemMap.get(result.name)!,
				amount: result.amount,
				record: result.record
			} : null;
		}

		async giveItem(item: Item | string, transaction = this.client.knex): Promise<void> {
			await transaction("items")
				.insert({
					userID: this.id,
					name: typeof item === "string" ? item : item.id,
					amount: 1,
					record: 1
				})
				.onConflict("userID")
				.merge({
					amount: transaction.raw("amount + 1"),
					record: transaction.raw("GREATEST(amount, record)")
				});
		}

		async giveCandyCanes(amount: number, transaction = this.client.knex) {
			await this.ensureDB(transaction);

			await transaction("userData")
				.increment("candyCanes", amount)
				.where({ userID: this.id });
		}

		async givePresents(level, amount, transaction = this.client.knex): Promise<void> {
			await this.ensureDB(transaction);

			await transaction("userData")
				.increment(`lvl${level}Presents`, amount)
				.where({ userID: this.id });
		}

		async removePresents(level: number, amount: number, transaction = this.client.knex): Promise<boolean> {
			try {
				await this.ensureDB(transaction);

				await transaction("userData")
					.decrement(`lvl${level}Presents`, amount)
					.where({ userID: this.id });

				return true;
			} catch (err) {
				if (err.code === "ER_WARN_DATA_OUT_OF_RANGE") {
					return false;
				} else {
					throw err;
				}
			}
		}
	}
);
