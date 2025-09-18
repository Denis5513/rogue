export class Key {
	constructor(name) {
		this.name = name;
		this.isPressed = false;
	}
}

export class KeyController {
	constructor(keys) {
		this.keys = Object.fromEntries(keys.map((key) => [key.name, key]));

		document.addEventListener("keydown", (event) => {
			const key = this.keys[event.key];
			if (key) key.isPressed = true;
		});

		document.addEventListener("keyup", (event) => {
			const key = this.keys[event.key];
			if (key) key.isPressed = false;
		});
	}
}
