import { and, between, eq, gte, lte, sql } from "drizzle-orm";
import DatabaseConnection from "@/core/infrastructure/database";
import { transactions } from "@/schema";
import { ITransactionRepository } from "../../domain/ports/transaction-repository.port";
import { ITransaction } from "../../domain/entities/ITransaction";
import { TransactionFilters } from "../../application/dtos/transaction.dto";

export class PgTransactionRepository implements ITransactionRepository {
	private db = DatabaseConnection.getInstance().db;
	private static instance: PgTransactionRepository;

	private constructor() {}

	public static getInstance(): PgTransactionRepository {
		if (!PgTransactionRepository.instance) {
			PgTransactionRepository.instance = new PgTransactionRepository();
		}
		return PgTransactionRepository.instance;
	}

	async findAll(): Promise<ITransaction[]> {
		const result = await this.db.select().from(transactions);
		return result.map(this.mapToEntity);
	}

	async findById(id: number): Promise<ITransaction | null> {
		const result = await this.db
			.select()
			.from(transactions)
			.where(eq(transactions.id, id));
		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUserId(userId: number): Promise<ITransaction[]> {
		const result = await this.db
			.select()
			.from(transactions)
			.where(eq(transactions.user_id, userId));
		return result.map(this.mapToEntity);
	}

	async findByFilters(
		userId: number,
		filters: TransactionFilters
	): Promise<ITransaction[]> {
		const conditions = [eq(transactions.user_id, userId)];

		if (filters.startDate && filters.endDate) {
			conditions.push(
				between(
					transactions.date,
					new Date(filters.startDate),
					new Date(filters.endDate)
				)
			);
		} else if (filters.startDate) {
			conditions.push(gte(transactions.date, new Date(filters.startDate)));
		} else if (filters.endDate) {
			conditions.push(lte(transactions.date, new Date(filters.endDate)));
		}

		if (filters.type) {
			conditions.push(eq(transactions.type, filters.type));
		}

		if (filters.category) {
			conditions.push(eq(transactions.category, filters.category));
		}

		if (filters.payment_method_id) {
			conditions.push(
				eq(transactions.payment_method_id, filters.payment_method_id)
			);
		}

		if (filters.min_amount) {
			conditions.push(
				gte(transactions.amount, sql`${filters.min_amount}::numeric`)
			);
		}

		if (filters.max_amount) {
			conditions.push(
				lte(transactions.amount, sql`${filters.max_amount}::numeric`)
			);
		}

		const result = await this.db
			.select()
			.from(transactions)
			.where(and(...conditions))
			.orderBy(transactions.date);

		return result.map(this.mapToEntity);
	}

	async create(
		transactionData: Omit<ITransaction, "id" | "date">
	): Promise<ITransaction> {
		const result = await this.db
			.insert(transactions)
			.values({
				user_id: transactionData.userId,
				amount: transactionData.amount.toString(),
				type: transactionData.type,
				category: transactionData.category,
				description: transactionData.description || null,
				payment_method_id: transactionData.paymentMethodId || null,
				scheduled_transaction_id:
					transactionData.scheduledTransactionId || null,
				debt_id: transactionData.debtId || null,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async update(
		id: number,
		transactionData: Partial<ITransaction>
	): Promise<ITransaction> {
		const updateData: Record<string, any> = {};

		if (transactionData.amount !== undefined) {
			updateData.amount = transactionData.amount;
		}
		if (transactionData.type !== undefined) {
			updateData.type = transactionData.type;
		}
		if (transactionData.category !== undefined) {
			updateData.category = transactionData.category;
		}
		if (transactionData.description !== undefined) {
			updateData.description = transactionData.description;
		}
		if (transactionData.paymentMethodId !== undefined) {
			updateData.payment_method_id = transactionData.paymentMethodId;
		}
		if (transactionData.scheduledTransactionId !== undefined) {
			updateData.scheduled_transaction_id =
				transactionData.scheduledTransactionId;
		}
		if (transactionData.debtId !== undefined) {
			updateData.debt_id = transactionData.debtId;
		}

		const result = await this.db
			.update(transactions)
			.set(updateData)
			.where(eq(transactions.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.delete(transactions)
			.where(eq(transactions.id, id))
			.returning();

		return result.length > 0;
	}

	async getMonthlyBalance(
		userId: number,
		month: Date
	): Promise<{
		totalIncome: number;
		totalExpense: number;
		balance: number;
	}> {
		const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
		const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

		const result = await this.db
			.select({
				type: transactions.type,
				total: sql<number>`sum(${transactions.amount})`,
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.user_id, userId),
					between(transactions.date, startDate, endDate)
				)
			)
			.groupBy(transactions.type);

		const totals = {
			totalIncome: 0,
			totalExpense: 0,
			balance: 0,
		};

		result.forEach((row) => {
			if (row.type === "INCOME") {
				totals.totalIncome = Number(row.total) || 0;
			} else {
				totals.totalExpense = Number(row.total) || 0;
			}
		});

		totals.balance = totals.totalIncome - totals.totalExpense;
		return totals;
	}

	async getCategoryTotals(
		userId: number,
		startDate: Date,
		endDate: Date
	): Promise<Array<{ category: string; total: number }>> {
		const result = await this.db
			.select({
				category: transactions.category,
				total: sql<number>`sum(${transactions.amount})`,
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.user_id, userId),
					between(transactions.date, startDate, endDate)
				)
			)
			.groupBy(transactions.category);

		return result.map((row) => ({
			category: row.category,
			total: Number(row.total) || 0,
		}));
	}

	private mapToEntity(raw: any): ITransaction {
		return {
			id: raw.id,
			userId: raw.user_id,
			amount: Number(raw.amount),
			type: raw.type,
			category: raw.category,
			description: raw.description,
			paymentMethodId: raw.payment_method_id,
			date: raw.date,
			scheduledTransactionId: raw.scheduled_transaction_id,
			debtId: raw.debt_id,
		};
	}
}
