import { imagekit } from "@/lib/imagekit";
import { roomSchema } from "@/lib/zod";
import { Elysia, t } from "elysia";

const app = new Elysia({ prefix: "/api" }).get("/", "").post(
	"/",
	async ({ body }) => {
		const { success, data } = roomSchema.safeParse(body);

		if (!success) return { message: "Invalid data" };

		try {
			const imageBuffer = Buffer.from(await data?.avatar?.arrayBuffer());

			const upload = await imagekit.upload({
				file: imageBuffer,
				fileName: `${data?.username}-${Date.now()}.png`,
				folder: "realtime-chat/avatars",
			});

			return upload;
		} catch (error) {
			console.error("Upload error:", error);
		}
		return body;
	},
	{
		body: t.Object({
			username: t.String({ minLength: 5 }),
			roomId: t.String(),
			duration: t.Numeric({ minimum: 600, maximum: 3600 }),
			avatar: t.File(),
		}),
	},
);

export const GET = app.fetch;
export const POST = app.fetch;
export type App = typeof app;
