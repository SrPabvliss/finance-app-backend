import { IBudget } from "../entities/IBudget";

export interface IBudgetRepository {
	findAll(): Promise<IBudget[]>;
	findById(id: number): Promise<IBudget | null>;
	findByUserId(userId: number): Promise<IBudget[]>;
	findByUserIdAndMonth(userId: number, month: Date): Promise<IBudget[]>;
	findSharedWithUser(userId: number): Promise<IBudget[]>;
	create(budget: Omit<IBudget, "id">): Promise<IBudget>;
	update(id: number, budget: Partial<IBudget>): Promise<IBudget>;
	delete(id: number): Promise<boolean>;
	updateAmount(id: number, amount: number): Promise<IBudget>;
}
