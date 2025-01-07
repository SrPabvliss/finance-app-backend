import { z } from "zod";
import { selectFriendSchema } from "@/friends/application/dtos/friend.dto";
import { IFriend } from "@/friends/domain/entities/IFriend";

export class FriendApiAdapter {
	static toApiResponse(friend: IFriend): z.infer<typeof selectFriendSchema> {
		return {
			id: friend.id,
			user_id: friend.userId,
			friend_id: friend.friendId,
			connection_date: friend.connectionDate,
		};
	}

	static toApiResponseList(
		friends: IFriend[]
	): z.infer<typeof selectFriendSchema>[] {
		return friends.map(this.toApiResponse);
	}
}
