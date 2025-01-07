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

export class FriendService implements IFriendService {
	private static instance: FriendService;

	constructor(
		private readonly friendRepository: IFriendRepository,
		private readonly friendUtils: FriendUtilsService
	) {}

	public static getInstance(
		friendRepository: IFriendRepository,
		friendUtils: FriendUtilsService
	): FriendService {
		if (!FriendService.instance) {
			FriendService.instance = new FriendService(friendRepository, friendUtils);
		}
		return FriendService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const friends = await this.friendRepository.findAll();
		return c.json(
			{
				success: true,
				data: FriendApiAdapter.toApiResponseList(friends),
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
				data: FriendApiAdapter.toApiResponse(friend),
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

		const friends = await this.friendRepository.findByUserId(Number(userId));
		return c.json(
			{
				success: true,
				data: FriendApiAdapter.toApiResponseList(friends),
				message: "User friends retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");

		// Validar que el usuario existe
		const userValidation = await this.friendUtils.validateUser(data.user_id);
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

		// Validar la amistad
		const friendshipValidation = await this.friendUtils.validateFriendship(
			data.user_id,
			data.friend_id
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

		const friend = await this.friendRepository.create({
			userId: data.user_id,
			friendId: data.friend_id,
		});

		return c.json(
			{
				success: true,
				data: FriendApiAdapter.toApiResponse(friend),
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
