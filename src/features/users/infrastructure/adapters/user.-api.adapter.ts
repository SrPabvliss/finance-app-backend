import { selectUsersSchema } from "@/users/application/dtos/user.dto";
import { IUser } from "@/users/domain/entities/IUser";
import { z } from "zod";

export class UserApiAdapter {
	static toApiResponse(user: IUser): z.infer<typeof selectUsersSchema> {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			active: user.active,
			username: user.username,
			password_hash: user.passwordHash,
			registration_date: user.registrationDate,
			recovery_token: user.recoveryToken || null,
			recovery_token_expires: user.recoveryTokenExpires || null,
		};
	}

	static toApiResponseList(
		users: IUser[]
	): z.infer<typeof selectUsersSchema>[] {
		return users.map(this.toApiResponse);
	}
}
