import { randomIntRange } from "./random.js";

export default function generateMinPasses(rooms) {
	const xPassages = [];
	const yPassages = [];

	rooms.forEach(({ pos, size }, i) => {
		if (xPassages.find((x) => x >= pos[0] && x <= pos[0] + size[0]) !== undefined) return;
		if (yPassages.find((y) => y >= pos[1] && y <= pos[1] + size[1]) !== undefined) return;

		if (i % 2 === 0) {
			const x = randomIntRange(pos[0], pos[0] + size[0] + 1);
			xPassages.push(x);
			return;
		}

		const y = randomIntRange(pos[1], pos[1] + size[1] + 1);
		yPassages.push(y);
	});

	return [xPassages, yPassages];
}
