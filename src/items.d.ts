import type { SantasElf } from ".";
import type { Message } from "discord.js";

interface ItemEntry {
	id: string;
	rank: number;
	worth?: number;
	displayName: string;
	messageName: string;
	response: string;
	defaultBehavior: boolean;
	onFind(client: SantasElf, message: Message): void | Promise<void>;
}
export = [] as Readonly<ItemEntry[]>;