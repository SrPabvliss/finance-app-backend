export interface IBudget {
	id: number;
	userId: number;
	sharedUserId?: number | null;
	category: string;
	limitAmount: number;
	currentAmount: number;
	month: Date;
}
