import { z } from "zod";

export const roomSchema = z.object({
	username: z
		.string({ error: "Username is required" })
		.min(5, "Username must be at least 5 characters")
		.max(30, "Username must be below 30 characters"),
	roomId: z.nanoid("Invalid room id"),
	duration: z
		.number({ error: "Duration is required" })
		.min(10 * 60)
		.max(60 * 60),
	avatar: z
		.file({ error: "File is required" })
		.max(2 * 1024 * 1024, "Max file size is 2MB")
		.mime(["image/jpeg", "image/png", "image/jpg"]),
	type: z.enum(["private", "group"]),
});

export type roomSchemaType = z.infer<typeof roomSchema>;
