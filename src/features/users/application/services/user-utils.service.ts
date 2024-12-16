import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

export class UserUtilsService {
	private static instance: UserUtilsService;

	constructor(private readonly userRepository: IUserRepository) {}

	public static getInstance(userRepository: IUserRepository): UserUtilsService {
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

	async validateUniqueFields(
		email: string,
		username: string
	): Promise<{
		isValid: boolean;
		field?: "email" | "username";
	}> {
		const [emailExists, usernameExists] = await Promise.all([
			this.isEmailTaken(email),
			this.isUsernameTaken(username),
		]);

		if (emailExists) {
			return { isValid: false, field: "email" };
		}

		if (usernameExists) {
			return { isValid: false, field: "username" };
		}

		return { isValid: true };
	}

	async validateEmailUnique(email: string): Promise<boolean> {
		return !(await this.isEmailTaken(email));
	}

	async validateUsernameUnique(username: string): Promise<boolean> {
		return !(await this.isUsernameTaken(username));
	}
}
