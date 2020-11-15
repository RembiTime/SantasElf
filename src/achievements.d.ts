import type { SantasElf } from ".";
import type { Message } from "discord.js";

type AchievementEntry<T extends string | string[]> = {
	id: T[];
	displayName: T[];
	description: string;
	prize?: T[];
	tiers: number;
	onFind(client: SantasElf, message: Message): void | Promise<void>;
} & (T extends string ? {} : { keyID: string })
export = [] as Readonly<AchievementEntry[]>;