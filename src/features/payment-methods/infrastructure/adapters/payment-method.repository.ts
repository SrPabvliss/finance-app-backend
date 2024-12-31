import { eq } from "drizzle-orm";
import DatabaseConnection from "@/core/infrastructure/database";
import { payment_methods } from "@/schema";
import { IPaymentMethodRepository } from "../../domain/ports/payment-method-repository.port";
import { IPaymentMethod } from "../../domain/entities/IPaymentMethod";

export class PgPaymentMethodRepository implements IPaymentMethodRepository {
	private db = DatabaseConnection.getInstance().db;
	private static instance: PgPaymentMethodRepository;

	private constructor() {}

	public static getInstance(): PgPaymentMethodRepository {
		if (!PgPaymentMethodRepository.instance) {
			PgPaymentMethodRepository.instance = new PgPaymentMethodRepository();
		}
		return PgPaymentMethodRepository.instance;
	}

	async findAll(): Promise<IPaymentMethod[]> {
		const result = await this.db.select().from(payment_methods);
		return result.map(this.mapToEntity);
	}

	async findById(id: number): Promise<IPaymentMethod | null> {
		const result = await this.db
			.select()
			.from(payment_methods)
			.where(eq(payment_methods.id, id));

		return result[0] ? this.mapToEntity(result[0]) : null;
	}

	async findByUserId(userId: number): Promise<IPaymentMethod[]> {
		const result = await this.db
			.select()
			.from(payment_methods)
			.where(eq(payment_methods.user_id, userId));

		return result.map(this.mapToEntity);
	}

	async findSharedWithUser(userId: number): Promise<IPaymentMethod[]> {
		const result = await this.db
			.select()
			.from(payment_methods)
			.where(eq(payment_methods.shared_user_id, userId));

		return result.map(this.mapToEntity);
	}

	async create(
		paymentMethod: Omit<IPaymentMethod, "id">
	): Promise<IPaymentMethod> {
		const result = await this.db
			.insert(payment_methods)
			.values({
				user_id: paymentMethod.userId,
				shared_user_id: paymentMethod.sharedUserId || null,
				name: paymentMethod.name,
				type: paymentMethod.type,
				last_four_digits: paymentMethod.lastFourDigits || null,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async update(
		id: number,
		paymentMethod: Partial<IPaymentMethod>
	): Promise<IPaymentMethod> {
		const result = await this.db
			.update(payment_methods)
			.set({
				name: paymentMethod.name,
				type: paymentMethod.type,
				last_four_digits: paymentMethod.lastFourDigits,
				shared_user_id: paymentMethod.sharedUserId,
			})
			.where(eq(payment_methods.id, id))
			.returning();

		return this.mapToEntity(result[0]);
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db
			.delete(payment_methods)
			.where(eq(payment_methods.id, id))
			.returning();

		return result.length > 0;
	}

	private mapToEntity(raw: any): IPaymentMethod {
		return {
			id: raw.id,
			userId: raw.user_id,
			sharedUserId: raw.shared_user_id,
			name: raw.name,
			type: raw.type,
			lastFourDigits: raw.last_four_digits,
		};
	}
}
