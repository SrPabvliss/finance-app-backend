import { eq, and } from "drizzle-orm";
import DatabaseConnection from "@/core/infrastructure/database";
import { budgets } from "@/schema";
import { IBudgetRepository } from "@/budgets/domain/ports/budget-repository.port";
import { IBudget } from "@/budgets/domain/entities/IBudget";

export class PgBudgetRepository implements IBudgetRepository {
	private db = DatabaseConnection.getInstance().db;
	private static instance: PgBudgetRepository;

	private constructor() {}

	public static getInstance(): PgBudgetRepository {
		if (!PgBudgetRepository.instance) {
			PgBudgetRepository.instance = new PgBudgetRepository();
		}
		return PgBudgetRepository.instance;
	}

	async findAll(): Promise<IBudget[]> {
		const result = await this.db.select().from(budgets);
		return result.map(this.mapToEntity);
	}

	async findById(id: number): Promise<IBudget | null> {
		const result = await this.db
			.select()
			.from(budgets)
			.where(eq(budgets.id, id));

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUserId(userId: number): Promise<IBudget[]> {
		const result = await this.db
			.select()
			.from(budgets)
			.where(eq(budgets.user_id, userId));

		return result.map(this.mapToEntity);
	}

	async findByUserIdAndMonth(userId: number, month: Date): Promise<IBudget[]> {
		const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
		const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

		const result = await this.db
			.select()
			.from(budgets)
			.where(
				and(
					eq(budgets.user_id, userId),
					and(
						eq(budgets.month, startOfMonth.toISOString()),
						eq(budgets.month, endOfMonth.toISOString())
					)
				)
			);

		return result.map(this.mapToEntity);
	}

	async findSharedWithUser(userId: number): Promise<IBudget[]> {
		const result = await this.db
			.select()
			.from(budgets)
			.where(eq(budgets.shared_user_id, userId));

		return result.map(this.mapToEntity);
	}

	async create(budgetData: Omit<IBudget, "id">): Promise<IBudget> {
		const result = await this.db
			.insert(budgets)
			.values({
				user_id: budgetData.userId,
				shared_user_id: budgetData.sharedUserId || null,
				category: budgetData.category,
				limit_amount: budgetData.limitAmount.toString(),
				current_amount: budgetData.currentAmount.toString(),
				month: budgetData.month.toISOString(),
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async update(id: number, budgetData: Partial<IBudget>): Promise<IBudget> {
		const updateData: Record<string, any> = {};

		if (budgetData.category !== undefined)
			updateData.category = budgetData.category;
		if (budgetData.limitAmount !== undefined)
			updateData.limit_amount = budgetData.limitAmount.toString();
		if (budgetData.currentAmount !== undefined)
			updateData.current_amount = budgetData.currentAmount.toString();
		if (budgetData.month !== undefined)
			updateData.month = budgetData.month.toISOString();
		if (budgetData.sharedUserId !== undefined)
			updateData.shared_user_id = budgetData.sharedUserId;

		const result = await this.db
			.update(budgets)
			.set(updateData)
			.where(eq(budgets.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.delete(budgets)
			.where(eq(budgets.id, id))
			.returning();

		return result.length > 0;
	}

	async updateAmount(id: number, amount: number): Promise<IBudget> {
		const budget = await this.findById(id);
		if (!budget) throw new Error("Budget not found");

		const newAmount = budget.currentAmount + amount;

		const result = await this.db
			.update(budgets)
			.set({
				current_amount: newAmount.toString(),
			})
			.where(eq(budgets.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	private mapToEntity(raw: any): IBudget {
		return {
			id: raw.id,
			userId: raw.user_id,
			sharedUserId: raw.shared_user_id,
			category: raw.category,
			limitAmount: Number(raw.limit_amount),
			currentAmount: Number(raw.current_amount),
			month: new Date(raw.month),
		};
	}
}
