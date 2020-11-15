import type { SantasElf } from ".";
import type { Message } from "discord.js";

export interface AchievementTier {
	displayName: string;
	description: string;
	prize: { type: "present", level: number } | { type: "candyCanes", amount: number };
	onFind?(client: SantasElf, message: Message): void | Promise<void>;
}
export interface AchievementEntry {
	id: string;
	tiers: AchievementTier[];
}
export = [] as Readonly<AchievementEntry[]>;