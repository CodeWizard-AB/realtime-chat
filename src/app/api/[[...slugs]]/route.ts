import { RESERVED_USERNAMES } from "@/lib/constants";
import { imagekit } from "@/lib/imagekit";
import { redis } from "@/lib/redis";
import { createRoomSchema, joinRoomSchema } from "@/lib/zod";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";

const app = new Elysia({ prefix: "/api/room" })
	.post(
		"/create",
		async ({ body, set, request }) => {
			// * INPUT DATA VALIDATION
			const { success, data, error } = createRoomSchema.safeParse(body);

			if (!success) {
				set.status = 400;
				return {
					error: "Invalid data input",
					issues: error.issues,
				};
			}

			// * DATA EXTRACTION
			const { username, duration, type, avatar, roomId } = data;
			const ip =
				request.headers.get("x-forwarded-for") ??
				request.headers.get("x-real-ip") ??
				"unknown";

			// * CHECK RESERVED USERNAMES
			if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
				set.status = 403;
				return {
					error: "This username is reserved. Please choose another one.",
				};
			}

			// * KEYS
			const lockKey = `username:lock:${username}`;
			const ipKey = `ip:${ip}:room:create`;

			try {
				// * USERNAME LOCK
				const lock = await redis.set(lockKey, "1", {
					nx: true,
					ex: 5,
				});

				if (!lock) {
					set.status = 409;
					return { error: "Username is busy right now. Try later." };
				}

				// * CHECK EXISTING ROOM
				const existingRoom = await redis.get(`user:${username}:room`);
				if (existingRoom) {
					set.status = 409;
					return {
						error:
							"You already have an active room. You can only create one room at a time.",
					};
				}

				// * IP RATE LIMIT
				const ipCount = await redis.incr(ipKey);

				if (ipCount === 1) {
					await redis.expire(ipKey, duration);
				}

				if (ipCount > 1) {
					set.status = 403;
					return {
						error:
							"You’ve created too many rooms in a short time. Please wait a bit and try again.",
					};
				}

				// * UPLOAD THE AVATAR IMAGE
				const imageBuffer = Buffer.from(await avatar?.arrayBuffer());
				const upload = await imagekit.upload({
					file: imageBuffer,
					fileName: `${username}-${Date.now()}.png`,
					folder: "realtime-chat/avatars",
				});

				// * CREATE THE ROOM
				const now = Math.floor(Date.now() / 1000);
				const ownerId = nanoid(12);
				const expiresAt = now + duration;
				await redis.hset(`room:${roomId}`, {
					ownerId,
					username,
					type,
					avatar: upload?.url,
					createdAt: now,
					expiresAt,
				});
				await redis.expire(`room:${data?.roomId}`, data?.duration);

				await redis.set(`user:${username}:room`, roomId, { ex: duration });

				return { roomId: data?.roomId, ownerId, expiresAt };
			} catch (error) {
				console.error("Upload error:", error);
			} finally {
				await redis.del(lockKey);
			}
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
