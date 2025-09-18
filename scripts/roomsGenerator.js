import { randomInt, randomIntRange } from "./random.js";

function getMultipliers(num) {
	let start = Math.ceil(Math.sqrt(num));
	for (; start <= num; ++start) {
		if (num % start === 0) return [num / start, start];
	}
	return -1;
}

function createMesh(roomsNumber, width, height) {
	const [lw, lh] = getMultipliers(roomsNumber).sort((a, b) => b - a);

	const mashX = new Array(lw).fill(Math.floor(width / lw));
	for (let i = 0; i < width % lw; ++i) {
		const j = randomInt(lw);
		++mashX[j];
	}

	const mashY = new Array(lh).fill(Math.floor(height / lh));
	for (let i = 0; i < height % lh; ++i) {
		const j = randomInt(lh);
		++mashY[j];
	}

	return [mashX, mashY];
}

function createRoom(dw, dh, minRoomSize, maxRoomSize) {
	const pos = [];
	const size = [];
	[dw, dh].forEach((dl) => {
		const max = Math.min(maxRoomSize, dl);
		let min = minRoomSize;
		if (max <= min) {
			console.error("Minimum room size cannot be reached");
			min = max - 1;
		}
		const sizel = randomIntRange(min, max);
		const posl = randomInt(dl - sizel);
		pos.push(posl);
		size.push(sizel);
	});

	return { pos, size };
}

export default function generateRooms(roomsNumber, width, height, minRoomSize, maxRoomSize) {
	const [mashX, mashY] = createMesh(roomsNumber, width, height);
	const rooms = [];
	let x = 0;
	for (const dw of mashX) {
		let y = 0;
		for (const dh of mashY) {
			const room = createRoom(dw, dh, minRoomSize, maxRoomSize);
			room.pos[0] += x;
			room.pos[1] += y;
			rooms.push(room);
			y += dh;
		}
		x += dw;
	}
	return rooms;
}
