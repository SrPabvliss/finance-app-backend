import { ITransactionRepository } from "@/transactions/domain/ports/transaction-repository.port";
import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";
import { IPaymentMethodRepository } from "@/payment-methods/domain/ports/payment-method-repository.port";

export class TransactionUtilsService {
	private static instance: TransactionUtilsService;

	constructor(
		private readonly transactionRepository: ITransactionRepository,
		private readonly userRepository: IUserRepository,
		private readonly paymentMethodRepository: IPaymentMethodRepository
	) {}

	public static getInstance(
		transactionRepository: ITransactionRepository,
		userRepository: IUserRepository,
		paymentMethodRepository: IPaymentMethodRepository
	): TransactionUtilsService {
		if (!TransactionUtilsService.instance) {
			TransactionUtilsService.instance = new TransactionUtilsService(
				transactionRepository,
				userRepository,
				paymentMethodRepository
			);
		}
		return TransactionUtilsService.instance;
	}

	async validateUser(userId: number): Promise<{
		isValid: boolean;
		user?: IUser;
	}> {
		const user = await this.userRepository.findById(userId);
		return {
			isValid: !!user,
			user: user || undefined,
		};
	}

	async validatePaymentMethod(
		paymentMethodId: number,
		userId: number
	): Promise<{
		isValid: boolean;
		message?: string;
	}> {
		const paymentMethod = await this.paymentMethodRepository.findById(
			paymentMethodId
		);

		if (!paymentMethod) {
			return {
				isValid: false,
				message: "Payment method not found",
			};
		}

		if (
			paymentMethod.userId !== userId &&
			paymentMethod.sharedUserId !== userId
		) {
			return {
				isValid: false,
				message: "Payment method does not belong to the user",
			};
		}

		return { isValid: true };
	}

	async canManageTransaction(
		transactionId: number,
		userId: number
	): Promise<boolean> {
		const transaction = await this.transactionRepository.findById(
			transactionId
		);
		return !!transaction && transaction.userId === userId;
	}
}
