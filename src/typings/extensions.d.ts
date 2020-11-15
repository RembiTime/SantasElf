import type { GuildDataRow } from "./tables";

declare module "discord.js" {
	interface Base {
		readonly client: SantasElf;
	}
	interface Guild {
		ensureDB(): Promise<void>;
		getData(): Promise<GuildDataRow>;
	}
	interface User {
		ensureDB(): Promise<void>;
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