import { hash } from "@/shared/utils/crypto.util";
import { IUser } from "@/users/domain/entities/IUser";
import { UserRepository } from "@/users/domain/ports/user-repository.port";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { CreateUserDto } from "../dtos/create-user.dto";
import { generateToken } from "@/shared/utils/token.util";
import { UserUtilsService } from "./user-utils.service";
import { IUserService } from "@/users/domain/ports/user-service.port";

export class UserService implements IUserService {
	private static instance: UserService;

	constructor(
		private readonly userRepository: UserRepository,
		private readonly userUtils: UserUtilsService
	) {}

	public static getInstance(
		userRepository: UserRepository,
		userUtils: UserUtilsService
	): UserService {
		if (!UserService.instance) {
			UserService.instance = new UserService(userRepository, userUtils);
		}
		return UserService.instance;
	}

	async create(data: CreateUserDto): Promise<IUser> {
		await this.userUtils.validateUniqueFields(data.email, data.username);

		const passwordHash = await hash(data.password);

		return this.userRepository.create({
			name: data.name,
			username: data.username,
			email: data.email,
			passwordHash,
			active: true,
		});
	}

	async update(id: number, data: UpdateUserDto): Promise<IUser> {
		const user = await this.getById(id);

		if (data.email && data.email !== user.email) {
			await this.userUtils.validateEmailUnique(data.email);
		}

		if (data.username && data.username !== user.username) {
			await this.userUtils.validateUsernameUnique(data.username);
		}

		const updateData: Partial<IUser> = {
			...data,
			...(data.password && { passwordHash: await hash(data.password) }),
		};

		return this.userRepository.update(id, updateData);
	}

	async delete(id: number): Promise<void> {
		await this.getById(id);
		await this.userRepository.delete(id);
	}

	async getById(id: number): Promise<IUser> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error("IUser not found");
		}
		return user;
	}

	async setRecoveryToken(id: number): Promise<string> {
		const user = await this.getById(id);

		const token = generateToken();
		const expires = new Date();
		expires.setHours(expires.getHours() + 24);

		await this.userRepository.setRecoveryToken(id, token, expires);

		return token;
	}

	async resetPassword(token: string, newPassword: string): Promise<void> {
		const user = await this.userRepository.findByRecoveryToken(token);

		if (!user || !user.recoveryTokenExpires) {
			throw new Error("Invalid or expired recovery token");
		}

		if (user.recoveryTokenExpires < new Date()) {
			throw new Error("Recovery token has expired");
		}

		const passwordHash = await hash(newPassword);

		await this.userRepository.update(user.id, {
			passwordHash,
			recoveryToken: null,
			recoveryTokenExpires: null,
		});
	}
}
