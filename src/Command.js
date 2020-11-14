const { Command: ACommand } = require("discord-akairo");
/**
 * @abstract
 */
class Command extends ACommand {
	/**
	 * @abstract
	 * @param {string} id 
	 * @param {import("discord-akairo").CommandOptions} [options]
	 */
	constructor(id, options) {
		super(id, options);
		/** @type {import(".").SantasElf} */
		this.client;
	}
	/**
	 * @abstract
	 * @param {import("discord.js").Message} message 
	 * @param {*} args 
	 * @returns {?}
	 */
	exec(message, args) {
		message;
		args;
	}
}

module.exports = {
	Command
};
