import { IPaymentMethod } from "../entities/IPaymentMethod";

export interface IPaymentMethodRepository {
	findAll(): Promise<IPaymentMethod[]>;
	findById(id: number): Promise<IPaymentMethod | null>;
	findByUserId(userId: number): Promise<IPaymentMethod[]>;
	findSharedWithUser(userId: number): Promise<IPaymentMethod[]>;
	create(paymentMethod: Omit<IPaymentMethod, "id">): Promise<IPaymentMethod>;
	update(
		id: number,
		paymentMethod: Partial<IPaymentMethod>
	): Promise<IPaymentMethod>;
	delete(id: number): Promise<boolean>;
}
