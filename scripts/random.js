export function randomInt(max) {
	if (max < 0) throw new Error("Values cannot be less than 0");
	return Math.floor(Math.random() * max);
}

export function randomIntRange(min, max) {
	return min + randomInt(max - min);
}

// Перемешиваем массив случайным образом
export function mixArray(arr) {
	for (let i = 0; i < arr.length; ++i) {
		const i1 = randomInt(arr.length);
		const i2 = randomInt(arr.length);
		[arr[i1], arr[i2]] = [arr[i2], arr[i1]];
	}

	return arr;
}
