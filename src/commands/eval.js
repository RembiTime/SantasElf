/* eslint-disable no-unused-vars */

const Akairo = require("discord-akairo");
const Discord = require("discord.js");
const util = require("util");

const { Command } = require("discord-akairo");

class EvalCommand extends Command {
	constructor() {
		super("eval", {
			aliases: ["eval"],
			description: "Evaluates javascript.",
			ownerOnly: true,
			args: [
				{
					id: "silent",
					match: "flag",
					flag: "--silent"
				},
				{
					id: "delsrc",
					match: "flag",
					flag: "--delsrc"
				},
				{
					id: "depth",
					match: "option",
					flag: "--depth=",
					type: "integer",
					default: 0
				},
				{
					id: "code",
					type: "string",
					match: "rest"
				}
			]
		});
	}

	/**
	 * @param {import("discord.js").Message} message
	 * @param {{ silent: boolean, delsrc: boolean, depth: number, code: string }} args
	 */
	async exec(message, { silent, delsrc, depth, code }) {

		if (delsrc && message.deletable) {
			message.delete();
		}

		const { client, guild, channel } = message;

		const codeBlockRE = /```(?:javascript|js)?(.+)```/isu;

		if (codeBlockRE.test(code)) {
			/* eslint-disable-next-line no-param-reassign */
			[, code] = code.match(codeBlockRE);
		}

		try {
			/* eslint-disable-next-line no-eval */
			const evaluated = await eval(code);

			if (!silent) {
				await message.channel.send(util.inspect(evaluated, { depth }), {
					code: "javascript",
					split: true
				});
			}
		} catch (err) {
			await message.channel.send(`ERROR: ${err}`);
		}
	}
}

module.exports = EvalCommand;
