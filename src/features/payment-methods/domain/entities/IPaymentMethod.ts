export interface IPaymentMethod {
	id: number;
	userId: number;
	sharedUserId?: number | null;
	name: string;
	type: string;
	lastFourDigits?: string | null;
}
