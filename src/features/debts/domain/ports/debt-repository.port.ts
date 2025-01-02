import { IDebt } from "../entities/IDebt";

export interface IDebtRepository {
	findAll(): Promise<IDebt[]>;
	findById(id: number): Promise<IDebt | null>;
	findByUserId(userId: number): Promise<IDebt[]>;
	findByCreditorId(creditorId: number): Promise<IDebt[]>;
	create(debt: Omit<IDebt, "id">): Promise<IDebt>;
	update(id: number, debt: Partial<IDebt>): Promise<IDebt>;
	delete(id: number): Promise<boolean>;
	updatePendingAmount(id: number, amount: number): Promise<IDebt>;
}
