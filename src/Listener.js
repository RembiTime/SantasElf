const { Listener: AListener } = require("discord-akairo");

class Listener extends AListener {
	/**
	 * 
	 * @param {string} id 
	 * @param {import("discord-akairo").ListenerOptions} options 
	 */
	constructor(id, options) {
		super(id, options);
		/** @type {import(".").SantasElf} */
		this.client;
	}
	/**
	 * @param {...any} args 
	 * @returns {*}
	 * @abstract
	 */
	exec(...args) {
		args;
	}
}

module.exports = {
	Listener
};
