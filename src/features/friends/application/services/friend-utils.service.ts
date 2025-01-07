import { IFriendRepository } from "@/friends/domain/ports/friend-repository.port";
import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

export class FriendUtilsService {
	private static instance: FriendUtilsService;

	constructor(
		private readonly friendRepository: IFriendRepository,
		private readonly userRepository: IUserRepository
	) {}

	public static getInstance(
		friendRepository: IFriendRepository,
		userRepository: IUserRepository
	): FriendUtilsService {
		if (!FriendUtilsService.instance) {
			FriendUtilsService.instance = new FriendUtilsService(
				friendRepository,
				userRepository
			);
		}
		return FriendUtilsService.instance;
	}

	async validateUser(userId: number): Promise<{
		isValid: boolean;
		user?: IUser;
	}> {
		const user = await this.userRepository.findById(userId);
		return {
			isValid: !!user,
			user: user || undefined,
		};
	}

	async validateFriendship(
		userId: number,
		friendId: number
	): Promise<{
		isValid: boolean;
		message?: string;
	}> {
		// Validar que no se está intentando ser amigo de sí mismo
		if (userId === friendId) {
			return {
				isValid: false,
				message: "Cannot be friends with yourself",
			};
		}

		// Validar que el amigo existe
		const friendExists = await this.validateUser(friendId);
		if (!friendExists.isValid) {
			return {
				isValid: false,
				message: "Friend not found",
			};
		}

		// Validar que no son ya amigos
		const existingFriendship = await this.friendRepository.findFriendship(
			userId,
			friendId
		);
		if (existingFriendship) {
			return {
				isValid: false,
				message: "Friendship already exists",
			};
		}

		return { isValid: true };
	}
}
