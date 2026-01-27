"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { AlertCircleIcon, HatGlasses, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateUsername } from "@/lib/helpers";
import { Controller, useForm } from "react-hook-form";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { joinRoomSchema, joinRoomSchemaType } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { STORAGE_KEY } from "@/lib/constants";
import { useEffect, useState } from "react";
import AvatarUpload from "@/components/avatar-upload";
import { client } from "@/lib/client";
import { Alert, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";

export default function JoinRoom() {
	const [error, setError] = useState<undefined | string>();
	const form = useForm<joinRoomSchemaType>({
		resolver: zodResolver(joinRoomSchema),
		mode: "onTouched",
		defaultValues: {
			username: "",
			roomId: "",
		},
	});

	const setUsername = () => {
		const username = generateUsername();
		localStorage.setItem(STORAGE_KEY, username);
		form.setValue("username", username, {
			shouldDirty: true,
			shouldValidate: true,
			shouldTouch: true,
		});
	};

	const onSubmit = async (data: joinRoomSchemaType) => {
		const { error } = await client.room.join.post(data);
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
				<form id="join-room-form" onSubmit={form.handleSubmit(onSubmit)}>
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
									<FieldLabel htmlFor={field.name}>Room ID</FieldLabel>
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
					<Button form="join-room-form" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? (
							<>
								<Spinner /> Joining Room...
							</>
						) : (
							"Join Private Room"
						)}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
