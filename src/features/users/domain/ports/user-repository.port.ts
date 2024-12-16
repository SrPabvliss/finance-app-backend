import { IUser } from "../entities/IUser";

export interface IUserRepository {
	findAll(): Promise<IUser[]>;
	findById(id: number): Promise<IUser | null>;
	findByEmail(email: string): Promise<IUser | null>;
	findByUsername(IUsername: string): Promise<IUser | null>;
	findByRecoveryToken(token: string): Promise<IUser | null>;
	create(IUser: Omit<IUser, "id" | "registrationDate">): Promise<IUser>;
	update(id: number, IUser: Partial<IUser>): Promise<IUser>;
	delete(id: number): Promise<boolean>;
	setRecoveryToken(id: number, token: string, expires: Date): Promise<boolean>;
	clearRecoveryToken(id: number): Promise<boolean>;
}
