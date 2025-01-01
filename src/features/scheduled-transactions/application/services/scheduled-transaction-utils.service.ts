import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";
import { IPaymentMethodRepository } from "@/payment-methods/domain/ports/payment-method-repository.port";
import { ITransactionRepository } from "@/transactions/domain/ports/transaction-repository.port";
import { IScheduledTransactionRepository } from "@/scheduled-transactions/domain/ports/scheduled-transaction-repository.port";

export class ScheduledTransactionUtilsService {
	private static instance: ScheduledTransactionUtilsService;

	constructor(
		private readonly scheduledTransactionRepository: IScheduledTransactionRepository,
		private readonly userRepository: IUserRepository,
		private readonly paymentMethodRepository: IPaymentMethodRepository,
		private readonly transactionRepository: ITransactionRepository
	) {}

	public static getInstance(
		scheduledTransactionRepository: IScheduledTransactionRepository,
		userRepository: IUserRepository,
		paymentMethodRepository: IPaymentMethodRepository,
		transactionRepository: ITransactionRepository
	): ScheduledTransactionUtilsService {
		if (!ScheduledTransactionUtilsService.instance) {
			ScheduledTransactionUtilsService.instance =
				new ScheduledTransactionUtilsService(
					scheduledTransactionRepository,
					userRepository,
					paymentMethodRepository,
					transactionRepository
				);
		}
		return ScheduledTransactionUtilsService.instance;
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

	async canManageScheduled(
		scheduledId: number,
		userId: number
	): Promise<boolean> {
		const scheduled = await this.scheduledTransactionRepository.findById(
			scheduledId
		);
		return !!scheduled && scheduled.userId === userId;
	}

	async validateScheduledTransaction(
		scheduledId: number,
		userId: number
	): Promise<{
		isValid: boolean;
		message?: string;
	}> {
		const scheduled = await this.scheduledTransactionRepository.findById(
			scheduledId
		);

		if (!scheduled) {
			return {
				isValid: false,
				message: "Scheduled transaction not found",
			};
		}

		if (!scheduled.active) {
			return {
				isValid: false,
				message: "Scheduled transaction is inactive",
			};
		}

		if (scheduled.userId !== userId) {
			return {
				isValid: false,
				message: "User does not own this scheduled transaction",
			};
		}

		return { isValid: true };
	}

	async wasExecutedToday(scheduledId: number): Promise<boolean> {
		const now = new Date();
		const startOfDay = new Date(now);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(now);
		endOfDay.setHours(23, 59, 59, 999);

		const transactions = await this.transactionRepository.findByFilters(0, {
			startDate: startOfDay.toISOString(),
			endDate: endOfDay.toISOString(),
			scheduled_transaction_id: scheduledId,
		});

		return transactions.length > 0;
	}

	async shouldExecute(scheduledId: number): Promise<boolean> {
		const scheduled = await this.scheduledTransactionRepository.findById(
			scheduledId
		);

		if (!scheduled) return false;

		const now = new Date();
		const utcNow = new Date(
			Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
		);
		const executionDate = new Date(scheduled.nextExecutionDate);
		const utcExecutionDate = executionDate;

		const isSameDay =
			utcNow.getUTCFullYear() === utcExecutionDate.getUTCFullYear() &&
			utcNow.getUTCMonth() === utcExecutionDate.getUTCMonth() &&
			utcNow.getUTCDate() === utcExecutionDate.getUTCDate();
		if (!isSameDay) return false;

		const startOfDay = new Date(utcNow);
		startOfDay.setUTCHours(0, 0, 0, 0);

		const endOfDay = new Date(utcNow);
		endOfDay.setUTCHours(23, 59, 59, 999);

		const transactions = await this.transactionRepository.findByFilters(0, {
			startDate: startOfDay.toISOString(),
			endDate: endOfDay.toISOString(),
			scheduled_transaction_id: scheduledId,
		});

		return transactions.length === 0;
	}
}
