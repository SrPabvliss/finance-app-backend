import { IFriendRepository } from "@/friends/domain/ports/friend-repository.port";
import { IFriendService } from "@/friends/domain/ports/friend-service.port";
import { FriendUtilsService } from "./friend-utils.service";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { FriendApiAdapter } from "@/friends/infrastructure/adapters/friend-api.adapter";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByUserRoute,
	ListRoute,
} from "@/friends/infrastructure/controllers/friend.routes";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

export class FriendService implements IFriendService {
	private static instance: FriendService;

	constructor(
		private readonly friendRepository: IFriendRepository,
		private readonly friendUtils: FriendUtilsService,
		private readonly userRepository: IUserRepository
	) {}

	public static getInstance(
		friendRepository: IFriendRepository,
		friendUtils: FriendUtilsService,
		userRepository: IUserRepository
	): FriendService {
		if (!FriendService.instance) {
			FriendService.instance = new FriendService(
				friendRepository,
				friendUtils,
				userRepository
			);
		}
		return FriendService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const friends = await this.friendRepository.findAll();
		const response = await FriendApiAdapter.toApiResponseList(
			friends,
			this.userRepository
		);
		return c.json(
			{
				success: true,
				data: response,
				message: "Friends retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const friend = await this.friendRepository.findById(Number(id));

		if (!friend) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Friend not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: await FriendApiAdapter.toApiResponse(friend, this.userRepository),
				message: "Friend retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserId = createHandler<ListByUserRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.friendUtils.validateUser(Number(userId));
		if (!userValidation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const friendships = await this.friendRepository.findByUserId(
			Number(userId)
		);
		const response = await FriendApiAdapter.toApiResponseList(
			friendships,
			this.userRepository
		);

		return c.json(
			{
				success: true,
				data: response,
				message: "User friends retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const { user_id, friend_email } = c.req.valid("json");

		const friend = await this.userRepository.findByEmail(friend_email);
		if (!friend) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const friendshipValidation = await this.friendUtils.validateFriendship(
			user_id,
			friend.id
		);

		if (!friendshipValidation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: friendshipValidation.message || "Invalid friendship",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		const friendship = await this.friendRepository.create({
			userId: user_id,
			friendId: friend.id,
		});

		const response = await FriendApiAdapter.toApiResponse(
			friendship,
			this.userRepository
		);

		return c.json(
			{
				success: true,
				data: response,
				message: "Friend added successfully",
			},
			HttpStatusCodes.CREATED
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const friend = await this.friendRepository.findById(Number(id));

		if (!friend) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Friend not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.friendRepository.delete(Number(id));
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "Friend removed successfully",
			},
			HttpStatusCodes.OK
		);
	});
}
