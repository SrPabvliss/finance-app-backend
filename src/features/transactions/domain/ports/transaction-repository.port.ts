import { ITransaction } from "../entities/ITransaction";
import { TransactionFilters } from "../../application/dtos/transaction.dto";

export interface ITransactionRepository {
	findAll(): Promise<ITransaction[]>;
	findById(id: number): Promise<ITransaction | null>;
	findByUserId(userId: number): Promise<ITransaction[]>;
	findByFilters(
		userId: number,
		filters: TransactionFilters
	): Promise<ITransaction[]>;
	create(transaction: Omit<ITransaction, "id" | "date">): Promise<ITransaction>;
	update(id: number, transaction: Partial<ITransaction>): Promise<ITransaction>;
	delete(id: number): Promise<boolean>;

	getMonthlyBalance(
		userId: number,
		month: Date
	): Promise<{
		totalIncome: number;
		totalExpense: number;
		balance: number;
	}>;
	getCategoryTotals(
		userId: number,
		startDate: Date,
		endDate: Date
	): Promise<
		Array<{
			category: string;
			total: number;
		}>
	>;
}
