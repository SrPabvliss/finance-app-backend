import { hash } from "@/shared/utils/crypto.util";
import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";
import { generateToken } from "@/shared/utils/token.util";
import { UserUtilsService } from "./user-utils.service";
import { IUserService } from "@/users/domain/ports/user-service.port";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListRoute,
	ResetPasswordRoute,
	SearchByEmailRoute,
	SetRecoveryTokenRoute,
	UpdateRoute,
} from "@/users/infrastructure/controllers/user.routes";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import { UserApiAdapter } from "@/users/infrastructure/adapters/user-api.adapter";

export class UserService implements IUserService {
	private static instance: UserService;

	constructor(
		private readonly userRepository: IUserRepository,
		private readonly userUtils: UserUtilsService
	) {}

	public static getInstance(
		userRepository: IUserRepository,
		userUtils: UserUtilsService
	): UserService {
		if (!UserService.instance) {
			UserService.instance = new UserService(userRepository, userUtils);
		}
		return UserService.instance;
	}

	searchByEmail = createHandler<SearchByEmailRoute>(async (c) => {
		const { email } = c.req.valid("query");

		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: {
					id: user.id,
					email: user.email,
					name: user.name,
					username: user.username,
				},
				message: "User found successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getAll = createHandler<ListRoute>(async (c) => {
		const users = await this.userRepository.findAll();
		return c.json(
			{
				success: true,
				data: UserApiAdapter.toApiResponseList(users),
				message: "Users retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");
		const validation = await this.userUtils.validateUniqueFields(
			data.email,
			data.username
		);

		if (!validation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: `The ${validation.field} is already taken`,
				},
				HttpStatusCodes.CONFLICT
			);
		}

		const passwordHash = await hash(data.password);
		const user = await this.userRepository.create({
			name: data.name,
			username: data.username,
			email: data.email,
			passwordHash,
			active: true,
		});

		return c.json(
			{
				success: true,
				data: UserApiAdapter.toApiResponse(user),
				message: "User created successfully",
			},
			HttpStatusCodes.CREATED
		);
	});

	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const user = await this.userRepository.findById(Number(id));

		if (!user) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		if (data.email && data.email !== user.email) {
			const isValid = await this.userUtils.validateEmailUnique(data.email);
			if (!isValid) {
				return c.json(
					{
						success: false,
						data: null,
						message: "The email is already taken",
					},
					HttpStatusCodes.CONFLICT
				);
			}
		}

		if (data.username && data.username !== user.username) {
			const valid = await this.userUtils.validateUsernameUnique(data.username);
			if (!valid) {
				return c.json(
					{
						success: false,
						data: null,
						message: "The username is already taken",
					},
					HttpStatusCodes.CONFLICT
				);
			}
		}

		const updateData: Partial<IUser> = {
			...data,
			...(data.password && { passwordHash: await hash(data.password) }),
		};

		const updatedUser = await this.userRepository.update(
			Number(id),
			updateData
		);
		return c.json(
			{
				success: true,
				data: UserApiAdapter.toApiResponse(updatedUser),
				message: "User updated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const user = await this.userRepository.findById(Number(id));

		if (!user) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.userRepository.delete(Number(id));
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "User deleted successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const user = await this.userRepository.findById(Number(id));

		if (!user) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: UserApiAdapter.toApiResponse(user),
				message: "User retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	setRecoveryToken = createHandler<SetRecoveryTokenRoute>(async (c) => {
		const { id } = c.req.valid("json");
		const user = await this.userRepository.findById(Number(id));

		if (!user) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const token = generateToken();
		const expires = new Date();
		expires.setHours(expires.getHours() + 24);

		await this.userRepository.setRecoveryToken(Number(id), token, expires);
		return c.json(
			{
				success: true,
				data: { token },
				message: "Recovery token generated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	resetPassword = createHandler<ResetPasswordRoute>(async (c) => {
		const { token, newPassword } = c.req.valid("json");
		const user = await this.userRepository.findByRecoveryToken(token);

		if (!user || !user.recoveryTokenExpires) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Invalid recovery token",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		if (user.recoveryTokenExpires < new Date()) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Recovery token has expired",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		const passwordHash = await hash(newPassword);
		await this.userRepository.update(user.id, {
			passwordHash,
			recoveryToken: null,
			recoveryTokenExpires: null,
		});

		return c.json(
			{
				success: true,
				data: { reset: true },
				message: "Password reset successfully",
			},
			HttpStatusCodes.OK
		);
	});
}
