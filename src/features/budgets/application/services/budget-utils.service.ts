import { IBudgetRepository } from "@/budgets/domain/ports/budget-repository.port";
import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

export class BudgetUtilsService {
	private static instance: BudgetUtilsService;

	constructor(
		private readonly budgetRepository: IBudgetRepository,
		private readonly userRepository: IUserRepository
	) {}

	public static getInstance(
		budgetRepository: IBudgetRepository,
		userRepository: IUserRepository
	): BudgetUtilsService {
		if (!BudgetUtilsService.instance) {
			BudgetUtilsService.instance = new BudgetUtilsService(
				budgetRepository,
				userRepository
			);
		}
		return BudgetUtilsService.instance;
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

	async validateOwnership(budgetId: number, userId: number): Promise<boolean> {
		const budget = await this.budgetRepository.findById(budgetId);
		return !!budget && budget.userId === userId;
	}

	async canAccess(budgetId: number, userId: number): Promise<boolean> {
		const budget = await this.budgetRepository.findById(budgetId);
		if (!budget) return false;

		return budget.userId === userId || budget.sharedUserId === userId;
	}

	async validateSharing(
		budgetId: number,
		userId: number,
		targetUserId: number
	): Promise<{
		isValid: boolean;
		message?: string;
	}> {
		const isOwner = await this.validateOwnership(budgetId, userId);
		if (!isOwner) {
			return {
				isValid: false,
				message: "Budget not found or you don't have permission",
			};
		}

		const targetUserExists = await this.validateUser(targetUserId);
		if (!targetUserExists.isValid) {
			return {
				isValid: false,
				message: "Target user not found",
			};
		}

		if (userId === targetUserId) {
			return {
				isValid: false,
				message: "Cannot share a budget with yourself",
			};
		}

		return { isValid: true };
	}

	async validateAmount(
		budgetId: number,
		userId: number,
		amount: number
	): Promise<{
		isValid: boolean;
		message?: string;
		budget?: any;
	}> {
		const budget = await this.budgetRepository.findById(budgetId);

		if (!budget) {
			return {
				isValid: false,
				message: "Budget not found",
			};
		}

		if (!(await this.canAccess(budgetId, userId))) {
			return {
				isValid: false,
				message: "You don't have access to this budget",
			};
		}

		const newAmount = budget.currentAmount + amount;
		if (newAmount > budget.limitAmount) {
			return {
				isValid: false,
				message: "The amount would exceed the budget limit",
				budget,
			};
		}

		const budgetMonth = new Date(budget.month);
		const currentMonth = new Date();
		if (
			budgetMonth.getMonth() !== currentMonth.getMonth() ||
			budgetMonth.getFullYear() !== currentMonth.getFullYear()
		) {
			return {
				isValid: false,
				message: "Cannot update amount for past or future budgets",
				budget,
			};
		}

		return {
			isValid: true,
			budget,
		};
	}
}
