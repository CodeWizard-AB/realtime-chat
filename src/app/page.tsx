"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { HatGlasses, Terminal } from "lucide-react";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "chat_username";
const ADJECTIVES = [
	"Swift",
	"Brave",
	"Clever",
	"Fierce",
	"Mighty",
	"Wise",
	"Bold",
	"Nimble",
	"Valiant",
	"Fearless",
];
const ANIMALS = [
	"Lion",
	"Eagle",
	"Wolf",
	"Tiger",
	"Falcon",
	"Bear",
	"Shark",
	"Panther",
	"Dragon",
	"Hawk",
];

const generateUsername = () => {
	const randomAdjective =
		ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
	const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

	return `${randomAdjective}-${randomAnimal}-${nanoid(5)}`;
};

export default function Home() {
	const [username, setUsername] = useState("");

	useEffect(() => {
		let storedUsername = localStorage.getItem(STORAGE_KEY);

		if (!storedUsername) {
			storedUsername = generateUsername();
			localStorage.setItem(STORAGE_KEY, storedUsername);
		}

		setUsername(storedUsername);
	}, []);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4">
			<div className="text-center mb-8 space-y-2">
				<h1 className="text-xl flex items-center justify-center gap-2 font-bold text-primary">
					<Terminal />
					JACKFRUIT_PRIVATE_CHAT
				</h1>
				<p>A private, secure chat room for you</p>
			</div>
			<Card>
				<CardContent>
					<Label htmlFor="username" className="mb-4 block text-lg font-medium">
						Your Private Room ID
					</Label>
					<InputGroup>
						<InputGroupInput
							id="username"
							placeholder="Write your room ID"
							defaultValue={username}
						/>
						<InputGroupAddon>
							<HatGlasses />
						</InputGroupAddon>
					</InputGroup>
				</CardContent>
				<CardFooter>
					<Button className="w-full">Create Private Room</Button>
				</CardFooter>
			</Card>
		</main>
	);
}
