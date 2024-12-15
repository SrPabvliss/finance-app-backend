import { IUser } from "@/users/domain/entities/IUser";
import { UserRepository } from "@/users/domain/ports/user-repository.port";

export class UserUtilsService {
	private static instance: UserUtilsService;

	constructor(private readonly userRepository: UserRepository) {}

	public static getInstance(userRepository: UserRepository): UserUtilsService {
		if (!UserUtilsService.instance) {
			UserUtilsService.instance = new UserUtilsService(userRepository);
		}
		return UserUtilsService.instance;
	}

	async getByEmail(email: string): Promise<IUser> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new Error("IUser not found");
		}
		return user;
	}

	async getByUsername(username: string): Promise<IUser> {
		const user = await this.userRepository.findByUsername(username);
		if (!user) {
			throw new Error("IUser not found");
		}
		return user;
	}

	async isEmailTaken(email: string): Promise<boolean> {
		const user = await this.userRepository.findByEmail(email);
		return !!user;
	}

	async isUsernameTaken(username: string): Promise<boolean> {
		const user = await this.userRepository.findByUsername(username);
		return !!user;
	}

	async validateUniqueFields(email: string, username: string): Promise<void> {
		const [emailExists, usernameExists] = await Promise.all([
			this.isEmailTaken(email),
			this.isUsernameTaken(username),
		]);

		if (emailExists) {
			throw new Error("Email already exists");
		}

		if (usernameExists) {
			throw new Error("Username already exists");
		}
	}

	async validateEmailUnique(email: string): Promise<void> {
		if (await this.isEmailTaken(email)) {
			throw new Error("Email already exists");
		}
	}

	async validateUsernameUnique(username: string): Promise<void> {
		if (await this.isUsernameTaken(username)) {
			throw new Error("Username already exists");
		}
	}
}
