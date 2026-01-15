import { nanoid } from "nanoid";
import { ADJECTIVES, ANIMALS } from "./constants";

export const generateUsername = () => {
	const randomAdjective =
		ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
	const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
	const username = `${randomAdjective}-${randomAnimal}-${nanoid(5)}`;

	return username;
};
