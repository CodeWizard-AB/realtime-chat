import { z } from "zod";

export const roomSchema = z.object({
	username: z.string({ error: "Username is required" }).min(3).max(30),
	roomId: z.string({ error: "Room ID is required" }).min(3).max(50),
	duration: z
		.number({ error: "Duration is required" })
		.min(10 * 60)
		.max(60 * 60),
	avatar: z
		.file({ error: "File is required" })
		.max(2 * 1024 * 1024, "Max file size is 2MB")
		.mime(["image/jpeg", "image/png", "image/jpg"])
});

export type roomSchemaType = z.infer<typeof roomSchema>;
