import { IDebt } from "@/debts/domain/entities/IDebt";
import { IDebtRepository } from "@/debts/domain/ports/debt-repository.port";
import { ITransactionRepository } from "@/transactions/domain/ports/transaction-repository.port";
import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

export class DebtUtilsService {
	private static instance: DebtUtilsService;

	constructor(
		private readonly debtRepository: IDebtRepository,
		private readonly userRepository: IUserRepository,
		private readonly transactionRepository: ITransactionRepository
	) {}

	public static getInstance(
		debtRepository: IDebtRepository,
		userRepository: IUserRepository,
		transactionRepository: ITransactionRepository
	): DebtUtilsService {
		if (!DebtUtilsService.instance) {
			DebtUtilsService.instance = new DebtUtilsService(
				debtRepository,
				userRepository,
				transactionRepository
			);
		}
		return DebtUtilsService.instance;
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

	async validateDebt(
		debtId: number,
		userId: number,
		amount?: number
	): Promise<{
		isValid: boolean;
		message?: string;
		debt?: IDebt;
	}> {
		const debt = await this.debtRepository.findById(debtId);

		if (!debt) {
			return {
				isValid: false,
				message: "Debt not found",
			};
		}

		if (debt.userId !== userId && debt.creditorId !== userId) {
			return {
				isValid: false,
				message: "You don't have access to this debt",
			};
		}

		if (debt.paid) {
			return {
				isValid: false,
				message: "This debt is already paid",
				debt,
			};
		}

		if (amount && amount > debt.pendingAmount) {
			return {
				isValid: false,
				message: "Payment amount exceeds pending amount",
				debt,
			};
		}

		return {
			isValid: true,
			debt,
		};
	}

	async canManageDebt(debtId: number, userId: number): Promise<boolean> {
		const debt = await this.debtRepository.findById(debtId);
		if (!debt) return false;

		return debt.userId === userId || debt.creditorId === userId;
	}
}
