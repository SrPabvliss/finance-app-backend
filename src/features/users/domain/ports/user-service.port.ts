import { CreateUserDto } from "../../application/dtos/create-user.dto";
import { UpdateUserDto } from "../../application/dtos/update-user.dto";
import { IUser } from "../entities/IUser";

export interface IUserService {
	create(data: CreateUserDto): Promise<IUser>;
	update(id: number, data: UpdateUserDto): Promise<IUser>;
	delete(id: number): Promise<boolean>;
	getById(id: number): Promise<IUser>;
	setRecoveryToken(id: number): Promise<string>;
	resetPassword(token: string, newPassword: string): Promise<boolean>;
}
