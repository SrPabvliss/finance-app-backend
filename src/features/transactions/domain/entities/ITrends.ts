export interface MonthlyTrendResult {
	month: Date;
	type: "INCOME" | "EXPENSE";
	total: string;
}

export interface MonthlyTrendData {
	month: string;
	income: number;
	expense: number;
}
