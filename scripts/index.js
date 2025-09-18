import Map from "./map.js";
import { EntitiesController, Player, HealthPotion, Sword, Enemy } from "./entity.js";
import { Key, KeyController } from "./keys.js";

const mapConfig = {
	width: 40,
	height: 24,
	fieldWidthPx: 1024,
	fieldHeightPx: 640,
	minRoomNumber: 5,
	maxRoomNumber: 10,
	maxRoomSize: 8,
	minRoomSize: 3,
	minPassesNumber: 3,
};

const itemsConfig = {
	interactionRadius: 0.5,
	swordDamageBuff: 2,
};

const playerConfig = {
	velosity: 10,
	interactionRadius: 1,
	maxHP: 10,
	defaultDamage: 2,
	TBA: 0.5, //<- время "перезарядки" атаки
};

const enemyConfig = {
	velosity: 2,
	interactionRadius: 1,
	TBA: 1.0,
	maxHP: 10,
	defaultDamage: 2,
};

export default class Game {
	constructor() {}

	init() {
		console.log("Game started!");

		const keyS = new Key("s");
		const keyW = new Key("w");
		const keyA = new Key("a");
		const keyD = new Key("d");
		const keySpace = new Key(" ");

		// Контролирует состояния кнопок: isPressed
		const keyController = new KeyController([keyS, keyD, keyA, keyW, keySpace]);

		// Генерация карты
		const map = new Map(mapConfig);
		map.init(".field");

		const spawnPoints = map.generateSpawnPoints();

		const player = new Player({
			...playerConfig,
			position: spawnPoints.splice(0, 1)[0],
			keysConfig: [
				[keyS, [0, 1]],
				[keyW, [0, -1]],
				[keyD, [1, 0]],
				[keyA, [-1, 0]],
			],
			attackKey: keySpace,
		});
		const potions = spawnPoints
			.splice(0, 10)
			.map((position) => new HealthPotion({ ...itemsConfig, position }));
		const swords = spawnPoints
			.splice(0, 2)
			.map((position) => new Sword({ ...itemsConfig, position }));
		const enemies = spawnPoints
			.splice(0, 10)
			.map((position) => new Enemy({ ...enemyConfig, position }));

		// Контролирует состояния всех "сущностей" и отрисовывает их
		const entitiesController = new EntitiesController(
			[player, ...potions, ...swords, ...enemies],
			map
		);
		entitiesController.init(".field");

		map.drawMap();
		const render = (timestamp) => {
			entitiesController.performAllEntities(timestamp);
			entitiesController.drawEntities();
			requestAnimationFrame(render);
		};
		render(null);
	}
}
