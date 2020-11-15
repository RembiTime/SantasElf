import type { GuildDataRow } from "./tables";
import type { AchievementEntry } from "../achievements";
import type Knex from "knex";

declare module "discord.js" {
	interface Guild {
		ensureDB(): Promise<void>;
		fetchData(): Promise<GuildDataRow>;
	}
	interface User {
		ensureDB(): Promise<void>;
		fetchAchievements(): Promise<Array<{ achievement: import("../achievements").AchievementEntry, tiers: number[] }>>;
	}
}

declare module "mysql2" {
	interface OkPacket {
		length: number;
	}
	interface ResultSetHeader {
		length: number;
	}
}
