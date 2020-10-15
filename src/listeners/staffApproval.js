const { Listener } = require("discord-akairo");

class StaffApprovalListener extends Listener {
	constructor() {
		super("staff-approval", {
			emitter: "client",
			event: "messageReactionAdd"
		});
	}

	async exec(reaction, user) {
		if (reaction.message.channel.id !== "766143817497313331") {
			console.log("Wrong channel");
			return;
		}

		const checkMessageID = await this.client.database.checkStaffApprovalIDs({ messageID: reaction.message.id });

		if (checkMessageID === null) {
			console.log("No ID Check Stored")
			return;
		}
		console.log(reaction._emoji.name)
	}
}

module.exports = StaffApprovalListener;
