import { imagekit } from "@/lib/imagekit";
import { redis } from "@/lib/redis";
import { createRoomSchema, joinRoomSchema } from "@/lib/zod";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";

const app = new Elysia({ prefix: "/api/room" })
	.post(
		"/create",
		async ({ body }) => {
			const { success, data } = createRoomSchema.safeParse(body);

			if (!success) return { error: "Invalid data" };

			try {
				// * UPLOAD THE AVATAR IMAGE
				const imageBuffer = Buffer.from(await data?.avatar?.arrayBuffer());
				const upload = await imagekit.upload({
					file: imageBuffer,
					fileName: `${data?.username}-${Date.now()}.png`,
					folder: "realtime-chat/avatars",
				});

				// * CREATE THE ROOM
				const now = Math.floor(Date.now() / 1000);
				const ownerId = nanoid(12);
				const expiresAt = now + data.duration;
				await redis.hset(`room:${data?.roomId}`, {
					ownerId,
					username: data?.username,
					type: data?.type,
					avatar: upload?.url,
					createdAt: now,
					expiresAt,
				});
				await redis.expire(`room:${data?.roomId}`, data?.duration);

				return { roomId: data?.roomId, ownerId, expiresAt };
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
	)
	.post(
		"/join",
		async ({ body, set }) => {
			const { success, data } = joinRoomSchema.safeParse(body);

			// * VALIDATION
			if (!success) return { error: "Invalid data" };
			const { roomId, username } = data;

			// * CHECK ROOM EXISTS
			const room = await redis.hgetall(`room:${roomId}`);
			if (!room || !Object.keys(room).length) {
				set.status = 404;
				return { error: "ROOM_NOT_FOUND" };
			}

			// * CHECK ROOM EXPIRY
			const now = Math.floor(Date.now() / 1000);
			if (Number(room.expiresAt) <= now) {
				set.status = 410;
				return { error: "ROOM_EXPIRED" };
			}

			// * ADD USER TO MEMBERS
			const userId = nanoid();
			await redis.sadd(`room:${roomId}:members`, userId);

			// * SYNC TTL WITH ROOM
			const ttl = await redis.ttl(`room:${roomId}`);
			await redis.expire(`room:${roomId}:members`, ttl);

			return {
				roomId,
				userId,
				username,
				expiresAt: Number(room.expiresAt),
			};
		},
		{
			body: t.Object({
				roomId: t.String({ minLength: 10, maxLength: 30 }),
				username: t.String({ minLength: 5, maxLength: 30 }),
				avatar: t.File(),
			}),
		},
	);

export const GET = app.fetch;
export const POST = app.fetch;
export type App = typeof app;
