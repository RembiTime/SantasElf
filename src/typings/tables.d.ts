export type GuildDataRow = Readonly<{
	readonly guildID: string;
	displayMessageID: string | null;
	isPartner: boolean;
	appealed3Deny: boolean;
	inviteURL: string | null;
}>

export type UserDataRow = Readonly<{
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
}>

export type PresentRow = Readonly<{
	id: number;
	code: string;
	presentLevel: number;
	timesFound: number;
	guildID?: string;
	channelID?: string;
	hiddenByID: string;
	usesLeft?: number;
}>

export type StaffApprovalRow = Readonly<{
	readonly messageID: string;
	status: "ONGOING" | "ACCEPTED" | "DENIED";
	claimedByID?: string;
	code: string;
	presentLevel: number;
	guildID: string;
	channelID: string;
	hiddenByID: string;
}>

export type ItemDataRow = Readonly<{
	name: string,
	userID: string,
	amount: number,
	record: number
}>;

declare module "knex/types/tables" {
	interface Tables {
		presents: PresentRow,
		guildData: GuildDataRow,
		userData: UserDataRow,
		staffApproval: StaffApprovalRow,
		items: ItemDataRow
	}
}
