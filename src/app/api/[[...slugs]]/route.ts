import { imagekit } from "@/lib/imagekit";
import { redis } from "@/lib/redis";
import { roomSchema } from "@/lib/zod";
import { Elysia, t } from "elysia";

const app = new Elysia({ prefix: "/api" }).get("/", "").post(
	"/room",
	async ({ body }) => {
		const { success, data } = roomSchema.safeParse(body);

		if (!success) return { message: "Invalid data" };

		try {
			const now = Math.floor(Date.now() / 1000);
			const imageBuffer = Buffer.from(await data?.avatar?.arrayBuffer());

			const upload = await imagekit.upload({
				file: imageBuffer,
				fileName: `${data?.username}-${Date.now()}.png`,
				folder: "realtime-chat/avatars",
			});

			await redis.hset(`room:${data?.roomId}`, {
				username: data?.username,
				type: data?.type,
				avatar: upload?.url,
				createdAt: now,
				expiresAt: now + data?.duration,
			});

			await redis.expire(`room:${data?.roomId}`, data?.duration);

			return { message: "Room has created!" };
		} catch (error) {
			console.error("Upload error:", error);
		}
		return body;
	},
	{
		body: t.Object({
			username: t.String({ minLength: 5, maxLength: 30 }),
			roomId: t.String({ minLength: 10, maxLength: 30 }),
			duration: t.Numeric({ minimum: 600, maximum: 3600 }),
			avatar: t.File(),
			type: t.Enum({ private: "private", group: "group" }),
		}),
	},
);

export const GET = app.fetch;
export const POST = app.fetch;
export type App = typeof app;
