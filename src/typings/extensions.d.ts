import { GuildDataRow } from "./tables";
import type { AchievementEntry } from "../achievements"

declare module "discord.js" {
	interface Base {
		readonly client: SantasElf;
	}
	interface Guild {
		ensureDB(): Promise<void>;
		fetchData(): Promise<GuildDataRow>;
	}
	interface User {
		ensureDB(): Promise<void>;
		fetchAchievements(): Promise<AchievementEntry>
	}
}

declare module "discord-akairo" {
	interface Command {
		client: SantasElf;
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
