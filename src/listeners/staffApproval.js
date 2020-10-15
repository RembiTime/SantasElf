const { Listener } = require("discord-akairo");

class StaffApprovalListener extends Listener {
	constructor() {
		super("staff-approval", {
			emitter: "client",
			event: "messageReactionAdd"
		});
	}

	exec(reaction, user) {
		// things go here
	}
}

module.exports = StaffApprovalListener;
