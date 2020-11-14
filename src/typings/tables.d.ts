export interface GuildDataRow {
	guildId: string;
	displayMessageId: string | null;
	isPartner: boolean;
	appealed3Deny: boolean;
	inviteURL: string | null;
}
declare module "mysql2" {
	interface OkPacket {
		length: number;
	}
	interface ResultSetHeader {
		length: number;
	}
}