"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	AlertCircleIcon,
	HatGlasses,
	Key,
	MessageSquareQuote,
	Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateUsername } from "@/lib/helpers";
import { Controller, useForm } from "react-hook-form";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { createRoomSchema, createRoomSchemaType } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CHAT_TYPES, DURATIONS, STORAGE_KEY } from "@/lib/constants";
import { useEffect, useState } from "react";
import AvatarUpload from "@/components/avatar-upload";
import { client } from "@/lib/client";
import { Alert, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";

export default function CreateRoom() {
	const [error, setError] = useState<string | undefined>();
	const form = useForm<createRoomSchemaType>({
		resolver: zodResolver(createRoomSchema),
		mode: "onTouched",
		defaultValues: {
			username: "",
			roomId: nanoid(),
			duration: DURATIONS[0].value,
			type: "private",
		},
	});

	const setRoomId = () => {
		const newRoomId = nanoid();
		form.setValue("roomId", newRoomId, {
			shouldDirty: true,
			shouldValidate: true,
			shouldTouch: true,
		});
	};

	const setUsername = () => {
		const username = generateUsername();
		localStorage.setItem(STORAGE_KEY, username);
		form.setValue("username", username, {
			shouldDirty: true,
			shouldValidate: true,
			shouldTouch: true,
		});
	};

	const onSubmit = async (data: createRoomSchemaType) => {
		const { error } = await client.room.create.post(data);
		if (error) {
			setError(error?.value?.message);
		}
	};

	useEffect(() => {
		let username = localStorage.getItem(STORAGE_KEY);
		if (!username) {
			username = generateUsername();
			localStorage.setItem(STORAGE_KEY, username);
		}
		form.setValue("username", username!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Card>
			<CardContent>
				<form id="create-room-form" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="avatar"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field>
									<AvatarUpload
										onFileChange={(file) => {
											field.onChange(file?.file as File);
										}}
									/>
									{fieldState.error && (
										<FieldError
											className="text-center"
											errors={[fieldState.error]}
										/>
									)}
								</Field>
							)}
						/>
						<Controller
							name="username"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<div className="flex justify-between">
										<FieldLabel htmlFor={field.name}>Username</FieldLabel>
										<Button
											size="sm"
											type="button"
											variant="secondary"
											onClick={setUsername}
										>
											Generate Username
										</Button>
									</div>
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
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
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
									<div className="flex justify-between">
										<FieldLabel htmlFor={field.name}>Room ID</FieldLabel>
										<Button
											size="sm"
											type="button"
											variant="secondary"
											onClick={setRoomId}
										>
											Generate Room ID
										</Button>
									</div>
									<InputGroup>
										<InputGroupAddon>
											<Key />
										</InputGroupAddon>
										<InputGroupInput
											{...field}
											id={field.name}
											placeholder="Write your room ID"
										/>
									</InputGroup>
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
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
										onValueChange={() => {
											field.onChange(+field.value);
										}}
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
						<Controller
							name="type"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									orientation="responsive"
									aria-invalid={fieldState.invalid}
								>
									<FieldLabel id={field.name}>Chat type</FieldLabel>
									<Select
										name={field.name}
										onValueChange={field.onChange}
										value={field.value}
									>
										<SelectTrigger
											id={field.name}
											aria-invalid={fieldState.invalid}
										>
											<div className="flex items-center gap-2">
												<MessageSquareQuote />
												<SelectValue placeholder="Select Duration" />
											</div>
										</SelectTrigger>
										<SelectContent>
											{CHAT_TYPES.map(({ label, value }) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
										</SelectContent>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Select>
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation="responsive">
					{error && !form.formState.isSubmitting && (
						<Alert className="text-red-400 rounded-none">
							<AlertCircleIcon />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<Button
						form="create-room-form"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? (
							<>
								<Spinner /> Creating Room...
							</>
						) : (
							"Create Private Room"
						)}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
