import { IFriend } from "../entities/IFriend";

export interface IFriendRepository {
	findAll(): Promise<IFriend[]>;
	findById(id: number): Promise<IFriend | null>;
	findByUserId(userId: number): Promise<IFriend[]>;
	create(friend: Omit<IFriend, "id" | "connectionDate">): Promise<IFriend>;
	delete(id: number): Promise<boolean>;
	findFriendship(userId: number, friendId: number): Promise<IFriend | null>;
}
