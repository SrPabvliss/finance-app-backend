import { IPaymentMethodRepository } from "@/payment-methods/domain/ports/payment-method-repository.port";
import { IUser } from "@/users/domain/entities/IUser";
import { IUserRepository } from "@/users/domain/ports/user-repository.port";

export class PaymentMethodUtilsService {
	private static instance: PaymentMethodUtilsService;

	constructor(
		private readonly paymentMethodRepository: IPaymentMethodRepository,
		private readonly userRepository: IUserRepository
	) {}

	public static getInstance(
		paymentMethodRepository: IPaymentMethodRepository,
		userRepository: IUserRepository
	): PaymentMethodUtilsService {
		if (!PaymentMethodUtilsService.instance) {
			PaymentMethodUtilsService.instance = new PaymentMethodUtilsService(
				paymentMethodRepository,
				userRepository
			);
		}
		return PaymentMethodUtilsService.instance;
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

	async validateOwnership(
		paymentMethodId: number,
		userId: number
	): Promise<boolean> {
		const paymentMethod = await this.paymentMethodRepository.findById(
			paymentMethodId
		);
		return !!paymentMethod && paymentMethod.userId === userId;
	}

	async canAccess(paymentMethodId: number, userId: number): Promise<boolean> {
		const paymentMethod = await this.paymentMethodRepository.findById(
			paymentMethodId
		);
		if (!paymentMethod) return false;

		return (
			paymentMethod.userId === userId || paymentMethod.sharedUserId === userId
		);
	}

	async validateSharing(
		paymentMethodId: number,
		userId: number,
		targetUserId: number
	): Promise<{
		isValid: boolean;
		message?: string;
	}> {
		const isOwner = await this.validateOwnership(paymentMethodId, userId);
		if (!isOwner) {
			return {
				isValid: false,
				message: "Payment method not found or you don't have permission",
			};
		}

		const targetUserExists = await this.validateUser(targetUserId);
		if (!targetUserExists.isValid) {
			return {
				isValid: false,
				message: "Target user not found",
			};
		}

		return { isValid: true };
	}
}
