import { z } from "zod";
import {
	FriendResponse,
	selectFriendSchema,
} from "@/friends/application/dtos/friend.dto";
import { IFriend } from "@/friends/domain/entities/IFriend";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

// En friend-api.adapter.ts
export class FriendApiAdapter {
	static async toApiResponse(
		friendship: IFriend,
		userRepository: IUserRepository
	): Promise<FriendResponse> {
		const friend = await userRepository.findById(friendship.friendId);

		return {
			id: friendship.id,
			friend: {
				id: friend!.id,
				name: friend!.name,
				username: friend!.username,
				email: friend!.email,
			},
			user_id: friendship.userId,
			connection_date: friendship.connectionDate.toISOString(),
		};
	}

	static async toApiResponseList(
		friendships: IFriend[],
		userRepository: IUserRepository
	): Promise<FriendResponse[]> {
		return Promise.all(
			friendships.map((f) => this.toApiResponse(f, userRepository))
		);
	}
}
