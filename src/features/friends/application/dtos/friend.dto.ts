import { friends } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const friendBaseSchema = createInsertSchema(friends);
export const selectFriendSchema = createSelectSchema(friends);

export const createFriendSchema = z.object({
	user_id: z.number(),
	friend_email: z.string().email("Invalid email format"),
});

export interface FriendResponse {
	id: number;
	friend: {
		id: number;
		name: string;
		username: string;
		email: string;
	};
	user_id: number;
	connection_date: string;
}

export const FriendResponseSchema = z.object({
	id: z.number(),
	friend: z.object({
		id: z.number(),
		name: z.string(),
		username: z.string(),
		email: z.string(),
	}),
	user_id: z.number(),
	connection_date: z.string(),
});

export type CreateFriendDTO = z.infer<typeof createFriendSchema>;
