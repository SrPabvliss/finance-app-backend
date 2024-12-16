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
	SetRecoveryTokenRoute,
	UpdateRoute,
} from "@/users/infrastructure/controllers/user.routes";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import { UserApiAdapter } from "@/users/infrastructure/adapters/user.-api.adapter";
import { createErrorResponse } from "@/shared/utils/error.util";

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

	getAll = createHandler<ListRoute>(async (c) => {
		const users = await this.userRepository.findAll();
		const apiResponse = UserApiAdapter.toApiResponseList(users);
		return c.json(apiResponse, HttpStatusCodes.OK);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");
		const validation = await this.userUtils.validateUniqueFields(
			data.email,
			data.username
		);

		if (!validation.isValid) {
			return c.json(
				createErrorResponse(`The ${validation.field} is already taken`),
				HttpStatusCodes.BAD_REQUEST
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

		return c.json(UserApiAdapter.toApiResponse(user), HttpStatusCodes.CREATED);
	});

	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");
		const user = await this.userRepository.findById(Number(id));

		if (!user) {
			return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
		}

		if (data.email && data.email !== user.email) {
			const isValid = await this.userUtils.validateEmailUnique(data.email);

			if (!isValid) {
				return c.json(
					createErrorResponse("The email is already taken"),
					HttpStatusCodes.BAD_REQUEST
				);
			}
		}

		if (data.username && data.username !== user.username) {
			const valid = await this.userUtils.validateUsernameUnique(data.username);

			if (!valid) {
				return c.json(
					createErrorResponse("The username is already taken"),
					HttpStatusCodes.BAD_REQUEST
				);
			}
		}

		const updateData: Partial<IUser> = {
			...data,
			...(data.password && { passwordHash: await hash(data.password) }),
		};

		console.log(updateData);

		const updatedUser = await this.userRepository.update(
			Number(id),
			updateData
		);
		return c.json(
			UserApiAdapter.toApiResponse(updatedUser),
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const user = await this.userRepository.findById(Number(id));
		if (!user) {
			return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
		}
		const deleted = await this.userRepository.delete(Number(id));
		return c.json({ success: deleted }, HttpStatusCodes.OK);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const user = await this.userRepository.findById(Number(id));
		if (!user) {
			return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
		}
		return c.json(UserApiAdapter.toApiResponse(user), HttpStatusCodes.OK);
	});

	setRecoveryToken = createHandler<SetRecoveryTokenRoute>(async (c) => {
		const { id } = c.req.valid("json");
		const user = await this.userRepository.findById(Number(id));

		if (!user) {
			return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
		}

		const token = generateToken();
		const expires = new Date();
		expires.setHours(expires.getHours() + 24);

		await this.userRepository.setRecoveryToken(Number(id), token, expires);
		return c.json({ token }, HttpStatusCodes.OK);
	});

	resetPassword = createHandler<ResetPasswordRoute>(async (c) => {
		const { token, newPassword } = c.req.valid("json");

		try {
			const user = await this.userRepository.findByRecoveryToken(token);

			if (!user || !user.recoveryTokenExpires) {
				return c.json(
					{ error: "Invalid or expired recovery token" },
					HttpStatusCodes.BAD_REQUEST
				);
			}

			if (user.recoveryTokenExpires < new Date()) {
				return c.json(
					{ error: "Recovery token has expired" },
					HttpStatusCodes.BAD_REQUEST
				);
			}

			const passwordHash = await hash(newPassword);
			await this.userRepository.update(user.id, {
				passwordHash,
				recoveryToken: null,
				recoveryTokenExpires: null,
			});

			return c.json({ success: true }, HttpStatusCodes.OK);
		} catch (error) {
			return c.json({ success: false }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}
	});
}
