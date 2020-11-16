import { Message, MessageEmbed, User } from "discord.js";

export type TextBasedChannel = Message["channel"];

export const showPages = async (pages: (MessageEmbed | string)[], channel: TextBasedChannel, user: User, time = 30000): Promise<Message> => {
	const message = await channel.send(pages[0]);
	const collector = message.createReactionCollector(() => true);

	const left = "◀️";
	const right = "▶️";
	const end = "⏹️";

	let page = 0;
	let timeout;

	collector.on("collect", (reaction, reactor) => {
		if (reactor.id === reactor.client.user.id) { return; }

		if (reactor.id !== user.id) { return; }

		reaction.users.remove(reactor).catch(() => {});

		if (reaction.emoji.name === left) {
			page--;
			if (page < 0) { page += pages.length; }

			message.edit(pages[page]);
			clearTimeout(timeout);
			timeout = setTimeout(() => collector.stop(), time);
		} else if (reaction.emoji.name === right) {
			page++;
			page %= pages.length;

			message.edit(pages[page]);
			clearTimeout(timeout);
			timeout = setTimeout(() => collector.stop(), time);
		} else if (reaction.emoji.name === end) {
			collector.stop();
		}
	});

	collector.once("end", async () => {
		clearTimeout(timeout);
		await message.delete();
	});

	await message.react(left);
	await message.react(end);
	await message.react(right);

	return message;
};
