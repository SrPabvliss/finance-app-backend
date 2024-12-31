import { IGoalRepository } from "@/goals/domain/ports/goal-repository.port";
import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

export class GoalUtilsService {
	private static instance: GoalUtilsService;

	constructor(
		private readonly goalRepository: IGoalRepository,
		private readonly userRepository: IUserRepository
	) {}

	public static getInstance(
		goalRepository: IGoalRepository,
		userRepository: IUserRepository
	): GoalUtilsService {
		if (!GoalUtilsService.instance) {
			GoalUtilsService.instance = new GoalUtilsService(
				goalRepository,
				userRepository
			);
		}
		return GoalUtilsService.instance;
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

	async validateOwnership(goalId: number, userId: number): Promise<boolean> {
		const goal = await this.goalRepository.findById(goalId);
		return !!goal && goal.userId === userId;
	}

	async canAccess(goalId: number, userId: number): Promise<boolean> {
		const goal = await this.goalRepository.findById(goalId);
		if (!goal) return false;

		return goal.userId === userId || goal.sharedUserId === userId;
	}

	async validateSharing(
		goalId: number,
		userId: number,
		targetUserId: number
	): Promise<{
		isValid: boolean;
		message?: string;
	}> {
		// Verificar que el usuario es el propietario
		const isOwner = await this.validateOwnership(goalId, userId);
		if (!isOwner) {
			return {
				isValid: false,
				message: "Goal not found or you don't have permission",
			};
		}

		// Verificar que el usuario objetivo existe
		const targetUserExists = await this.validateUser(targetUserId);
		if (!targetUserExists.isValid) {
			return {
				isValid: false,
				message: "Target user not found",
			};
		}

		// No permitir compartir con uno mismo
		if (userId === targetUserId) {
			return {
				isValid: false,
				message: "Cannot share a goal with yourself",
			};
		}

		return { isValid: true };
	}

	async validateProgress(
		goalId: number,
		userId: number,
		amount: number
	): Promise<{
		isValid: boolean;
		message?: string;
		goal?: any;
	}> {
		const goal = await this.goalRepository.findById(goalId);

		if (!goal) {
			return {
				isValid: false,
				message: "Goal not found",
			};
		}

		// Verificar si el usuario tiene acceso a la meta
		if (!(await this.canAccess(goalId, userId))) {
			return {
				isValid: false,
				message: "You don't have access to this goal",
			};
		}

		// Validar que el nuevo monto no exceda el objetivo
		const newAmount = goal.currentAmount + amount;
		if (newAmount > goal.targetAmount) {
			return {
				isValid: false,
				message: "The new amount would exceed the target amount",
				goal,
			};
		}

		// Verificar si la fecha límite no ha pasado
		if (new Date(goal.endDate) < new Date()) {
			return {
				isValid: false,
				message: "The goal has expired",
				goal,
			};
		}

		return {
			isValid: true,
			goal,
		};
	}
}
