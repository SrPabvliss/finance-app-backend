import { eq } from "drizzle-orm";
import DatabaseConnection from "@/db";
import { users } from "@/schema";
import { UserRepository } from "@/users/domain/ports/user-repository.port";
import { IUser } from "@/users/domain/entities/IUser";

export class PgUserRepository implements UserRepository {
	private db = DatabaseConnection.getInstance().db;

	private constructor() {}

	async findById(id: number): Promise<IUser | null> {
		const result = await this.db.select().from(users).where(eq(users.id, id));
		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByEmail(email: string): Promise<IUser | null> {
		const result = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email));
		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUsername(username: string): Promise<IUser | null> {
		const result = await this.db
			.select()
			.from(users)
			.where(eq(users.username, username));
		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async create(
		userData: Omit<IUser, "id" | "registrationDate">
	): Promise<IUser> {
		const result = await this.db
			.insert(users)
			.values({
				name: userData.name,
				username: userData.username,
				email: userData.email,
				password_hash: userData.passwordHash,
				active: userData.active,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async findByRecoveryToken(token: string): Promise<IUser | null> {
		const result = await this.db
			.select()
			.from(users)
			.where(eq(users.recovery_token, token));

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async update(id: number, userData: Partial<IUser>): Promise<IUser> {
		const result = await this.db
			.update(users)
			.set({
				name: userData.name,
				username: userData.username,
				email: userData.email,
				password_hash: userData.passwordHash,
				active: userData.active,
			})
			.where(eq(users.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.update(users)
			.set({ active: false })
			.where(eq(users.id, id))
			.returning();

		return result.length > 0;
	}

	async setRecoveryToken(
		id: number,
		token: string,
		expires: Date
	): Promise<boolean> {
		const result = await this.db
			.update(users)
			.set({
				recovery_token: token,
				recovery_token_expires: expires,
			})
			.where(eq(users.id, id))
			.returning();

		return result.length > 0;
	}

	async clearRecoveryToken(id: number): Promise<boolean> {
		const result = await this.db
			.update(users)
			.set({
				recovery_token: null,
				recovery_token_expires: null,
			})
			.where(eq(users.id, id))
			.returning();

		return result.length > 0;
	}

	private mapToEntity(raw: any): IUser {
		return {
			id: raw.id,
			name: raw.name,
			username: raw.username,
			email: raw.email,
			passwordHash: raw.password_hash,
			registrationDate: raw.registration_date,
			active: raw.active,
			recoveryToken: raw.recovery_token,
			recoveryTokenExpires: raw.recovery_token_expires,
		};
	}
}
