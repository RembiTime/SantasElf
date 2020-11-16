import type { GuildDataRow } from "./tables";
import type { AchievementEntry } from "../achievements";
import type Knex from "knex";

declare module "mysql2" {
	interface OkPacket {
		length: number;
	}
	interface ResultSetHeader {
		length: number;
	}
}
