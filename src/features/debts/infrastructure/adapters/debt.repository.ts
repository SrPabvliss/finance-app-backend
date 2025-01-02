import { eq } from "drizzle-orm";
import DatabaseConnection from "@/core/infrastructure/database";
import { debts } from "@/schema";
import { IDebt } from "@/debts/domain/entities/IDebt";
import { IDebtRepository } from "@/debts/domain/ports/debt-repository.port";

export class PgDebtRepository implements IDebtRepository {
	private db = DatabaseConnection.getInstance().db;
	private static instance: PgDebtRepository;

	private constructor() {}

	public static getInstance(): PgDebtRepository {
		if (!PgDebtRepository.instance) {
			PgDebtRepository.instance = new PgDebtRepository();
		}
		return PgDebtRepository.instance;
	}

	async findAll(): Promise<IDebt[]> {
		const result = await this.db.select().from(debts);
		return result.map(this.mapToEntity);
	}

	async findById(id: number): Promise<IDebt | null> {
		const result = await this.db.select().from(debts).where(eq(debts.id, id));

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUserId(userId: number): Promise<IDebt[]> {
		const result = await this.db
			.select()
			.from(debts)
			.where(eq(debts.user_id, userId));

		return result.map(this.mapToEntity);
	}

	async findByCreditorId(creditorId: number): Promise<IDebt[]> {
		const result = await this.db
			.select()
			.from(debts)
			.where(eq(debts.creditor_id, creditorId));

		return result.map(this.mapToEntity);
	}

	async create(debtData: Omit<IDebt, "id">): Promise<IDebt> {
		const result = await this.db
			.insert(debts)
			.values({
				user_id: debtData.userId,
				description: debtData.description,
				original_amount: debtData.originalAmount.toString(),
				pending_amount: debtData.pendingAmount.toString(),
				due_date: debtData.dueDate.toISOString(),
				paid: debtData.paid,
				creditor_id: debtData.creditorId || null,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async update(id: number, debtData: Partial<IDebt>): Promise<IDebt> {
		const updateData: Record<string, any> = {};

		if (debtData.description !== undefined)
			updateData.description = debtData.description;
		if (debtData.pendingAmount !== undefined)
			updateData.pending_amount = debtData.pendingAmount.toString();
		if (debtData.dueDate !== undefined)
			updateData.due_date = debtData.dueDate.toISOString();
		if (debtData.paid !== undefined) updateData.paid = debtData.paid;

		const result = await this.db
			.update(debts)
			.set(updateData)
			.where(eq(debts.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.delete(debts)
			.where(eq(debts.id, id))
			.returning();

		return result.length > 0;
	}

	async updatePendingAmount(id: number, amount: number): Promise<IDebt> {
		const debt = await this.findById(id);
		if (!debt) throw new Error("Debt not found");

		const newAmount = debt.pendingAmount - amount;
		const paid = newAmount <= 0;

		const result = await this.db
			.update(debts)
			.set({
				pending_amount: newAmount.toString(),
				paid,
			})
			.where(eq(debts.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	private mapToEntity(raw: any): IDebt {
		return {
			id: raw.id,
			userId: raw.user_id,
			description: raw.description,
			originalAmount: Number(raw.original_amount),
			pendingAmount: Number(raw.pending_amount),
			dueDate: new Date(raw.due_date),
			paid: raw.paid,
			creditorId: raw.creditor_id || null,
		};
	}
}
