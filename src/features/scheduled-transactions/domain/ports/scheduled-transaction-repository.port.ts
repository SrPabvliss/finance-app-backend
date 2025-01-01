import { IScheduledTransaction } from "../entities/IScheduledTransaction";

export interface IScheduledTransactionRepository {
	findAll(): Promise<IScheduledTransaction[]>;
	findById(id: number): Promise<IScheduledTransaction | null>;
	findByUserId(userId: number): Promise<IScheduledTransaction[]>;
	findPendingExecutions(): Promise<IScheduledTransaction[]>;
	create(
		scheduled: Omit<IScheduledTransaction, "id">
	): Promise<IScheduledTransaction>;
	update(
		id: number,
		scheduled: Partial<IScheduledTransaction>
	): Promise<IScheduledTransaction>;
	delete(id: number): Promise<boolean>;
}
