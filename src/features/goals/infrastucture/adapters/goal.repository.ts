import { eq } from "drizzle-orm";
import DatabaseConnection from "@/core/infrastructure/database";
import { goals } from "@/schema";
import { IGoalRepository } from "@/goals/domain/ports/goal-repository.port";
import { IGoal } from "@/goals/domain/entities/IGoal";

export class PgGoalRepository implements IGoalRepository {
	private db = DatabaseConnection.getInstance().db;
	private static instance: PgGoalRepository;

	private constructor() {}

	public static getInstance(): PgGoalRepository {
		if (!PgGoalRepository.instance) {
			PgGoalRepository.instance = new PgGoalRepository();
		}
		return PgGoalRepository.instance;
	}

	async findAll(): Promise<IGoal[]> {
		const result = await this.db.select().from(goals);
		return result.map(this.mapToEntity);
	}

	async findById(id: number): Promise<IGoal | null> {
		const result = await this.db.select().from(goals).where(eq(goals.id, id));

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUserId(userId: number): Promise<IGoal[]> {
		const result = await this.db
			.select()
			.from(goals)
			.where(eq(goals.user_id, userId));

		return result.map(this.mapToEntity);
	}

	async findSharedWithUser(userId: number): Promise<IGoal[]> {
		const result = await this.db
			.select()
			.from(goals)
			.where(eq(goals.shared_user_id, userId));

		return result.map(this.mapToEntity);
	}

	async create(goalData: Omit<IGoal, "id">): Promise<IGoal> {
		const result = await this.db
			.insert(goals)
			.values({
				user_id: goalData.userId,
				shared_user_id: goalData.sharedUserId || null,
				name: goalData.name,
				target_amount: goalData.targetAmount.toString(),
				current_amount: goalData.currentAmount.toString(),
				end_date: goalData.endDate.toISOString(), // Convertimos la fecha a string ISO
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async update(id: number, goalData: Partial<IGoal>): Promise<IGoal> {
		const updateData: Record<string, any> = {};

		if (goalData.name !== undefined) updateData.name = goalData.name;
		if (goalData.targetAmount !== undefined)
			updateData.target_amount = goalData.targetAmount.toString();
		if (goalData.currentAmount !== undefined)
			updateData.current_amount = goalData.currentAmount.toString();
		if (goalData.endDate !== undefined)
			updateData.end_date = goalData.endDate.toISOString(); // Convertimos la fecha a string ISO
		if (goalData.sharedUserId !== undefined)
			updateData.shared_user_id = goalData.sharedUserId;

		const result = await this.db
			.update(goals)
			.set(updateData)
			.where(eq(goals.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.delete(goals)
			.where(eq(goals.id, id))
			.returning();

		return result.length > 0;
	}

	async updateProgress(id: number, amount: number): Promise<IGoal> {
		const goal = await this.findById(id);
		if (!goal) throw new Error("Goal not found");

		const newAmount = goal.currentAmount + amount;

		const result = await this.db
			.update(goals)
			.set({
				current_amount: newAmount.toString(),
			})
			.where(eq(goals.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	private mapToEntity(raw: any): IGoal {
		return {
			id: raw.id,
			userId: raw.user_id,
			sharedUserId: raw.shared_user_id,
			name: raw.name,
			targetAmount: Number(raw.target_amount),
			currentAmount: Number(raw.current_amount),
			endDate: new Date(raw.end_date),
		};
	}
}
