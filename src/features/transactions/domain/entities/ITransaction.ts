export interface ITransaction {
	id: number;
	userId: number;
	amount: number;
	type: "INCOME" | "EXPENSE";
	category: string;
	description?: string | null;
	paymentMethodId?: number | null;
	date: Date;
	scheduledTransactionId?: number | null;
	debtId?: number | null;
}
