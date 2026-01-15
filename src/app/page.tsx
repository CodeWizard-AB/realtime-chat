"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { HatGlasses, Key, Terminal, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateUsername } from "@/lib/helpers";
import { Controller, useForm } from "react-hook-form";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { roomSchema, roomSchemaType } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DURATIONS, STORAGE_KEY } from "@/lib/constants";
import { useEffect } from "react";

export default function Home() {
	const form = useForm<roomSchemaType>({
		resolver: zodResolver(roomSchema),
		mode: "all",
		defaultValues: {
			username: "",
			roomId: nanoid(10),
			duration: DURATIONS[0].value,
		},
	});

	useEffect(() => {
		let username = localStorage.getItem(STORAGE_KEY);
		if (!username) {
			username = generateUsername();
			localStorage.setItem(STORAGE_KEY, username);
		}
		form.setValue("username", username!);
	}, []);

	function onSubmit(data: roomSchemaType) {
		console.log("Form Submitted:", data);
	}

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
					<form id="room-form" onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							<Controller
								name="username"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Username</FieldLabel>
										<InputGroup>
											<InputGroupInput
												{...field}
												id={field.name}
												placeholder="Write your username"
											/>
											<InputGroupAddon>
												<HatGlasses />
											</InputGroupAddon>
										</InputGroup>
									</Field>
								)}
							/>
							<Controller
								name="roomId"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field
										orientation="responsive"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel htmlFor={field.name}>Room ID</FieldLabel>
										<InputGroup>
											<InputGroupInput
												{...field}
												id={field.name}
												placeholder="Write your room ID"
											/>
											<InputGroupAddon>
												<Key />
											</InputGroupAddon>
										</InputGroup>
									</Field>
								)}
							/>
							<Controller
								name="duration"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field
										orientation="responsive"
										aria-invalid={fieldState.invalid}
									>
										<FieldLabel htmlFor={field.name}>Duration</FieldLabel>
										<Select
											name={field.name}
											onValueChange={field.onChange}
											value={field.value.toString()}
										>
											<SelectTrigger
												id={field.name}
												aria-invalid={fieldState.invalid}
											>
												<div className="flex items-center gap-2">
													<Timer />
													<SelectValue placeholder="Select Duration" />
												</div>
											</SelectTrigger>
											<SelectContent>
												{DURATIONS.map(({ label, value }, index) => (
													<SelectItem key={index} value={value.toString()}>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</FieldGroup>
					</form>
				</CardContent>
				<CardFooter className="flex items-center gap-6">
					<Field orientation="horizontal" className="gap-4">
						<Button>Create Private Room</Button>
						<Button>Join Private Chat</Button>
					</Field>
				</CardFooter>
			</Card>
		</main>
	);
}
