import { friends } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const friendBaseSchema = createInsertSchema(friends);
export const selectFriendSchema = createSelectSchema(friends);

export const createFriendSchema = friendBaseSchema
	.extend({
		friend_id: z.number(),
	})
	.omit({
		id: true,
		connection_date: true,
	});

export type FriendResponse = z.infer<typeof selectFriendSchema>;
export type CreateFriendDTO = z.infer<typeof createFriendSchema>;
