import { wallId } from "./map.js";
import { randomInt } from "./random.js";

export class Entity {
	constructor({
		type,
		position,
		collisions,
		interaction,
		velosity,
		size,
		interactionRadius = 0,
	}) {
		this.type = type;
		this.r = [...position];
		this.v = [0, 0];
		this.collisions = collisions;
		this.interaction = interaction;
		this.velosity = velosity;
		this.size = size;
		this.toDelete = false;
		this.intR = interactionRadius;
	}

	kill() {
		this.toDelete = true;
	}

	perform() {}

	interact() {}
}

export class Player extends Entity {
	constructor({
		position,
		velosity,
		keysConfig,
		attackKey,
		interactionRadius,
		TBA,
		maxHP,
		defaultDamage,
	}) {
		super({
			type: "player",
			position,
			collisions: true,
			interaction: true,
			velosity,
			size: 1,
			interactionRadius,
		});
		this.keysConfig = keysConfig;
		this.attackKey = attackKey;
		this.maxHP = maxHP;
		this.HP = maxHP;
		this.damage = defaultDamage;
		this.TBA = TBA;
		this.lastAttackTime = -Infinity;
	}

	perform() {
		if (this.HP <= 0) {
			this.kill();
			return;
		}

		this.v = [0, 0];
		this.keysConfig.forEach(([key, dir]) => {
			if (key.isPressed) {
				this.v[0] += dir[0];
				this.v[1] += dir[1];
			}
		});
		const vAbs = this.v[0] * this.v[0] + this.v[1] * this.v[1];
		if (vAbs >= 0.0001) {
			this.v[0] *= this.velosity / Math.sqrt(vAbs);
			this.v[1] *= this.velosity / Math.sqrt(vAbs);
		}
	}

	interact(entities, timestamp) {
		let isAttacked = false;
		if (this.attackKey.isPressed && timestamp - this.lastAttackTime >= this.TBA * 1000) {
			entities
				.filter((entity) => entity.type === "enemy")
				.forEach((enemy) => {
					enemy.HP -= this.damage;
					isAttacked = true;
				});
		}
		isAttacked && (this.lastAttackTime = timestamp);
	}
}

export class Enemy extends Entity {
	constructor({ position, velosity, interactionRadius, TBA, maxHP, defaultDamage }) {
		super({
			type: "enemy",
			position,
			interaction: true,
			collisions: true,
			velosity,
			size: 1,
			interactionRadius,
		});
		this.dir = randomInt(2) ? [this.velosity, 0] : [0, this.velosity];
		this.v = [...this.dir];
		this.TBA = TBA;
		this.maxHP = maxHP;
		this.HP = maxHP;
		this.damage = defaultDamage;
		this.lastAttackTime = -Infinity;
	}

	perform() {
		if (this.HP <= 0) {
			this.kill();
			return;
		}

		const vAbs = this.v[0] * this.v[0] + this.v[1] * this.v[1];
		if (vAbs <= 0.0001) {
			this.dir[0] = -this.dir[0];
			this.dir[1] = -this.dir[1];
			this.v = [...this.dir];
		}
	}

	interact(entities, timestamp) {
		let isAttacked = false;
		if (timestamp - this.lastAttackTime >= this.TBA * 1000) {
			entities
				.filter((entity) => entity.type === "player")
				.forEach((player) => {
					player.HP -= this.damage;
					isAttacked = true;
				});
		}
		isAttacked && (this.lastAttackTime = timestamp);
	}
}

export class HealthPotion extends Entity {
	constructor({ position, interactionRadius }) {
		super({
			type: "item-potion",
			position,
			collisions: false,
			interaction: true,
			velosity: 0,
			size: 1,
			interactionRadius,
		});
	}

	interact(entities) {
		entities
			.filter((entity) => entity.type === "player")
			.forEach((player) => {
				player.HP = player.maxHP;
				this.kill();
			});
	}
}

export class Sword extends Entity {
	constructor({ position, interactionRadius, swordDamageBuff }) {
		super({
			type: "item-sword",
			position,
			collisions: false,
			interaction: true,
			velosity: 0,
			size: 1,
			interactionRadius,
		});
		this.damageBuff = swordDamageBuff;
	}

	interact(entities) {
		entities
			.filter((entity) => entity.type === "player")
			.forEach((player) => {
				player.damage += this.damageBuff;
				this.kill();
			});
	}
}

export class EntitiesController {
	constructor(entities, map) {
		this.entities = entities;
		this.map = map;
		this.lastTimestamp = null;
	}

	init(field) {
		$(field).append(
			$("<div>", { class: "field-entities" }).css({
				width: "100%",
				height: "100%",
				position: "absolute",
			})
		);
		this.fieldEntitiesElem = ".field-entities";
	}

	performAllEntities(timestamp) {
		if (this.lastTimestamp === null) {
			this.lastTimestamp = timestamp;
			return;
		}
		const deltaT = timestamp - this.lastTimestamp;
		this.lastTimestamp = timestamp;

		this.entities.forEach((entity) => entity.perform(timestamp));

		this.entities.forEach((en, i) => {
			if (en.interaction === false) return;
			const interactiveEntities = this.entities.filter((en1, j) => {
				if (i === j) return false;
				const l = Math.pow(en.r[0] - en1.r[0], 2) + Math.pow(en.r[1] - en1.r[1], 2);
				return l <= Math.pow(en.intR, 2);
			});
			en.interact(interactiveEntities, timestamp);
		});

		this.entities = this.entities.filter((entity) => entity.toDelete === false);

		this.entities.forEach((entity) => {
			if (entity.collisions === false) return;

			entity.r.forEach((r, i) => {
				const l = i === 0 ? this.map.mapSize.width : this.map.mapSize.height;
				if (r - entity.size / 2 <= 0 && entity.v[i] < 0) {
					entity.v[i] = 0;
				} else if (r + entity.size / 2 >= l && entity.v[i] > 0) {
					entity.v[i] = 0;
				}
			});

			const blocks = this.map.getClosestBlocks(entity.r);
			blocks.forEach(([x0, y0], i) => {
				if (this.map.mapArray[x0]?.[y0] !== wallId) return;
				const j = Number(i >= 2);
				const k = i % 2 === 0 ? 1 : -1;
				const d = Number(i % 2 !== 0);
				if (
					entity.r[j] * k + entity.size / 2 >= ((j ? y0 : x0) + d) * k &&
					entity.v[j] * k > 0
				) {
					entity.v[j] = 0;
				}
			});
		});

		this.entities.forEach((entity) => {
			entity.r[0] += (deltaT * entity.v[0]) / 1000;
			entity.r[1] += (deltaT * entity.v[1]) / 1000;
		});
	}

	entityElement(entity) {
		const defaultElem = $("<div>").css({
			position: "absolute",
			width: entity.size * this.map.mapSize.blockWidthPx,
			height: entity.size * this.map.mapSize.blockHeightPx,
		});

		switch (entity.type) {
			case "player":
				return defaultElem.addClass("player tile tileP").append(
					$("<div>", { class: "health" }).css({
						width: `${(entity.HP / entity.maxHP) * 100}%`,
					})
				);

			case "enemy":
				return defaultElem.addClass("enemy tile tileE").append(
					$("<div>", { class: "health" }).css({
						width: `${(entity.HP / entity.maxHP) * 100}%`,
					})
				);

			case "item-potion":
				return defaultElem.addClass("item-potion tile tileHP");

			case "item-sword":
				return defaultElem.addClass("item-sword tile tileSW");

			default:
				return defaultElem.addClass("entity");
		}
	}

	drawEntities() {
		$(this.fieldEntitiesElem).empty();
		this.entities.forEach((entity) => {
			$(this.fieldEntitiesElem).append(
				this.entityElement(entity).css({
					left:
						entity.r[0] * this.map.mapSize.blockWidthPx -
						(entity.size * this.map.mapSize.blockWidthPx) / 2,
					top:
						entity.r[1] * this.map.mapSize.blockHeightPx -
						(entity.size * this.map.mapSize.blockHeightPx) / 2,
				})
			);
		});
	}
}
