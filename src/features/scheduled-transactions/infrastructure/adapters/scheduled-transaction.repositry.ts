import { and, eq, lte } from "drizzle-orm";
import DatabaseConnection from "@/core/infrastructure/database";
import { scheduled_transactions } from "@/schema";
import { IScheduledTransactionRepository } from "../../domain/ports/scheduled-transaction-repository.port";
import { IScheduledTransaction } from "../../domain/entities/IScheduledTransaction";

export class PgScheduledTransactionRepository
	implements IScheduledTransactionRepository
{
	private db = DatabaseConnection.getInstance().db;
	private static instance: PgScheduledTransactionRepository;

	private constructor() {}

	public static getInstance(): PgScheduledTransactionRepository {
		if (!PgScheduledTransactionRepository.instance) {
			PgScheduledTransactionRepository.instance =
				new PgScheduledTransactionRepository();
		}
		return PgScheduledTransactionRepository.instance;
	}

	async findAll(): Promise<IScheduledTransaction[]> {
		const result = await this.db.select().from(scheduled_transactions);
		return result.map(this.mapToEntity);
	}

	async findById(id: number): Promise<IScheduledTransaction | null> {
		const result = await this.db
			.select()
			.from(scheduled_transactions)
			.where(eq(scheduled_transactions.id, id));

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUserId(userId: number): Promise<IScheduledTransaction[]> {
		const result = await this.db
			.select()
			.from(scheduled_transactions)
			.where(eq(scheduled_transactions.user_id, userId));

		return result.map(this.mapToEntity);
	}

	async findPendingExecutions(): Promise<IScheduledTransaction[]> {
		const now = new Date();
		const result = await this.db
			.select()
			.from(scheduled_transactions)
			.where(
				and(
					eq(scheduled_transactions.active, true),
					lte(scheduled_transactions.next_execution_date, now.toISOString())
				)
			);

		return result.map(this.mapToEntity);
	}

	async create(
		scheduledData: Omit<IScheduledTransaction, "id">
	): Promise<IScheduledTransaction> {
		const result = await this.db
			.insert(scheduled_transactions)
			.values({
				user_id: scheduledData.userId,
				name: scheduledData.name,
				amount: scheduledData.amount.toString(),
				category: scheduledData.category,
				description: scheduledData.description || null,
				payment_method_id: scheduledData.paymentMethodId || null,
				frequency: scheduledData.frequency,
				next_execution_date: scheduledData.nextExecutionDate.toISOString(),
				active: scheduledData.active,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async update(
		id: number,
		scheduledData: Partial<IScheduledTransaction>
	): Promise<IScheduledTransaction> {
		const updateData: Record<string, any> = {};

		if (scheduledData.name !== undefined) updateData.name = scheduledData.name;
		if (scheduledData.amount !== undefined)
			updateData.amount = scheduledData.amount.toString();
		if (scheduledData.category !== undefined)
			updateData.category = scheduledData.category;
		if (scheduledData.description !== undefined)
			updateData.description = scheduledData.description;
		if (scheduledData.paymentMethodId !== undefined)
			updateData.payment_method_id = scheduledData.paymentMethodId;
		if (scheduledData.frequency !== undefined)
			updateData.frequency = scheduledData.frequency;
		if (scheduledData.nextExecutionDate !== undefined)
			updateData.next_execution_date =
				scheduledData.nextExecutionDate.toISOString();
		if (scheduledData.active !== undefined)
			updateData.active = scheduledData.active;

		const result = await this.db
			.update(scheduled_transactions)
			.set(updateData)
			.where(eq(scheduled_transactions.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.delete(scheduled_transactions)
			.where(eq(scheduled_transactions.id, id))
			.returning();

		return result.length > 0;
	}

	private mapToEntity(raw: any): IScheduledTransaction {
		return {
			id: raw.id,
			userId: raw.user_id,
			name: raw.name,
			amount: Number(raw.amount),
			category: raw.category,
			description: raw.description,
			paymentMethodId: raw.payment_method_id,
			frequency: raw.frequency,
			nextExecutionDate: new Date(raw.next_execution_date),
			active: raw.active,
		};
	}
}
