export interface IDebt {
	id: number;
	userId: number;
	description: string;
	originalAmount: number;
	pendingAmount: number;
	dueDate: Date;
	paid: boolean;
	creditorId?: number | null;
}
