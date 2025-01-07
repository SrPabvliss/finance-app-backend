import { eq, and, or } from "drizzle-orm";
import DatabaseConnection from "@/core/infrastructure/database";
import { friends } from "@/schema";
import { IFriendRepository } from "@/friends/domain/ports/friend-repository.port";
import { IFriend } from "@/friends/domain/entities/IFriend";

export class PgFriendRepository implements IFriendRepository {
	private db = DatabaseConnection.getInstance().db;
	private static instance: PgFriendRepository;

	private constructor() {}

	public static getInstance(): PgFriendRepository {
		if (!PgFriendRepository.instance) {
			PgFriendRepository.instance = new PgFriendRepository();
		}
		return PgFriendRepository.instance;
	}

	async findAll(): Promise<IFriend[]> {
		const result = await this.db.select().from(friends);
		return result.map(this.mapToEntity);
	}

	async findById(id: number): Promise<IFriend | null> {
		const result = await this.db
			.select()
			.from(friends)
			.where(eq(friends.id, id));

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUserId(userId: number): Promise<IFriend[]> {
		// Buscamos tanto amistades donde el usuario es user_id como friend_id
		const result = await this.db
			.select()
			.from(friends)
			.where(or(eq(friends.user_id, userId), eq(friends.friend_id, userId)));

		return result.map(this.mapToEntity);
	}

	async findFriendship(
		userId: number,
		friendId: number
	): Promise<IFriend | null> {
		// Buscar la amistad en ambas direcciones
		const result = await this.db
			.select()
			.from(friends)
			.where(
				or(
					and(eq(friends.user_id, userId), eq(friends.friend_id, friendId)),
					and(eq(friends.user_id, friendId), eq(friends.friend_id, userId))
				)
			);

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async create(
		friendData: Omit<IFriend, "id" | "connectionDate">
	): Promise<IFriend> {
		const result = await this.db
			.insert(friends)
			.values({
				user_id: friendData.userId,
				friend_id: friendData.friendId,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.delete(friends)
			.where(eq(friends.id, id))
			.returning();

		return result.length > 0;
	}

	private mapToEntity(raw: any): IFriend {
		return {
			id: raw.id,
			userId: raw.user_id,
			friendId: raw.friend_id,
			connectionDate: new Date(raw.connection_date),
		};
	}
}
