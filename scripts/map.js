import generateMinPassages from "./passagesGenerator.js";
import { mixArray, randomInt, randomIntRange } from "./random.js";
import generateRooms from "./roomsGenerator.js";

// id возможных блоков
export const tileId = 0;
export const wallId = 1;

const blockCssClass = ["tile", "tileW"];

export default class Map {
	constructor({ width, height, fieldWidthPx, fieldHeightPx, ...roomsInfo }) {
		const mapSizeInfo = {
			width,
			height,
			fieldWidthPx,
			fieldHeightPx,
			blockWidthPx: fieldWidthPx / width,
			blockHeightPx: fieldHeightPx / height,
		};

		this.mapSize = mapSizeInfo;
		this.roomsInfo = roomsInfo;

		this.mapArray = null;
	}

	get backgroundCss() {
		return {
			width: this.mapSize.fieldWidthPx,
			height: this.mapSize.fieldHeightPx,
			"background-repeat": "repeat",
			"background-size": `${this.mapSize.blockWidthPx}px ${this.mapSize.blockHeightPx}px`,
			"z-index": "-1",
			position: "absolute",
		};
	}

	get blockCss() {
		return {
			width: this.mapSize.blockWidthPx,
			height: this.mapSize.blockHeightPx,
			"background-repeat": "no-repeat",
			"background-size": `${this.mapSize.blockWidthPx}px ${this.mapSize.blockHeightPx}px`,
			position: "absolute",
		};
	}

	// Возвращает 4 ближайших соседних блока для pos (нужно для учёта коллизии)
	getClosestBlocks(pos) {
		const x = Math.floor(pos[0]);
		const y = Math.floor(pos[1]);
		return [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1],
		].map(([dx, dy]) => [x + dx, y + dy]);
	}

	// Генерирует последовательность случайных свободный позоций на карте
	generateSpawnPoints() {
		const freePoints = [];
		this.mapArray.forEach((line, x) =>
			line.forEach((block, y) => {
				if (block !== tileId) return;
				freePoints.push([x + 0.5, y + 0.5]);
			})
		);
		return mixArray(freePoints);
	}

	init(field) {
		this.fieldElem = field;
		this.initBackground();
		this.initMap();
	}

	initBackground() {
		$(this.fieldElem).prepend(
			$("<div>", { class: "field-background tile" }).css(this.backgroundCss)
		);
	}

	// Создаёт карту
	initMap() {
		const roomsNumber = randomIntRange(
			this.roomsInfo.minRoomNumber,
			this.roomsInfo.maxRoomNumber + 1
		);
		const rooms = generateRooms(
			roomsNumber,
			this.mapSize.width,
			this.mapSize.height,
			this.roomsInfo.minRoomSize,
			this.roomsInfo.maxRoomSize + 1
		);

		const [xPassages, yPassages] = generateMinPassages(rooms);
		[xPassages, yPassages].forEach((pass, k) => {
			const length = pass.length;
			if (length < this.roomsInfo.minPassesNumber) {
				for (let i = 0; i < this.roomsInfo.minPassesNumber - length; ++i) {
					const l = randomInt(k === 0 ? this.mapSize.width : this.mapSize.height);
					pass.push(l);
				}
			}
		});

		this.mapArray = Array.from({ length: this.mapSize.width }, (_, i) => {
			if (xPassages.find((x) => x === i) !== undefined)
				return new Array(this.mapSize.height).fill(tileId);
			return new Array(this.mapSize.height).fill(wallId);
		});

		yPassages.forEach((y) => {
			for (let x = 0; x < this.mapSize.width; ++x) {
				this.mapArray[x][y] = tileId;
			}
		});

		for (const { pos, size } of rooms) {
			const x1 = pos[0];
			const x2 = pos[0] + size[0];

			const y1 = pos[1];
			const y2 = pos[1] + size[1];

			for (let x = x1; x <= x2; ++x) {
				for (let y = y1; y <= y2; ++y) {
					this.mapArray[x][y] = tileId;
				}
			}
		}

		$(this.fieldElem).append(
			$("<div>", { class: "field-map" }).css({
				position: "absolute",
				width: "100%",
				height: "100%",
			})
		);

		this.fieldMapElem = ".field-map";
	}

	// Отрисовка карты
	drawMap() {
		this.mapArray.forEach((line, i) =>
			line.forEach((blockId, j) => {
				if (blockId === tileId) return;

				$(this.fieldMapElem).append(
					$("<div>", { class: blockCssClass[blockId] }).css({
						...this.blockCss,
						left: i * this.mapSize.blockWidthPx,
						top: j * this.mapSize.blockHeightPx,
					})
				);
			})
		);
	}
}
