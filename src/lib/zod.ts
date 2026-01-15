import { z } from "zod";

export const roomSchema = z.object({
	username: z.string().min(3).max(30),
	roomId: z.string().min(3).max(50),
	duration: z
		.number()
		.min(10 * 60)
		.max(60 * 60),
});

export type roomSchemaType = z.infer<typeof roomSchema>;
