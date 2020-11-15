export interface GuildDataRow {
	readonly guildId: string;
	displayMessageId: string | null;
	isPartner: boolean;
	appealed3Deny: boolean;
	inviteURL: string | null;
}
export interface UserDataRow {
	readonly userID: string;
	userName: string;
	candyCanes: number;
	wrongGuesses: number;
	firstFinder: number; // what is this even for
	totalPresents: number;
	lvl1Presents: number;
	lvl1Total: number;
	lvl2Presents: number;
	lvl2Total: number;
	lvl3Presents: number;
	lvl3Total: number;
	lvl4Presents: number;
	lvl4Total: number;
	lvl5Presents: number;
	lvl5Total: number;
}
export interface PresentRow {
	readonly id: number;
	code: string;
	presentLevel: number;
	timesFound: number;
	guildID?: string;
	channelID?: string;
	hiddenByID: string;
	usesLeft?: number;
}