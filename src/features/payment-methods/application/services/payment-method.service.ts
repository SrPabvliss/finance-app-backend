import { IPaymentMethodRepository } from "@/payment-methods/domain/ports/payment-method-repository.port";
import { IPaymentMethodService } from "@/payment-methods/domain/ports/payment-method-service.port";
import { PaymentMethodUtilsService } from "./payment-method-utils.service";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByUserRoute,
	ListRoute,
	ListSharedRoute,
	UpdateRoute,
} from "@/payment-methods/infrastructure/controllers/payment-method.routes";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import { PaymentMethodApiAdapter } from "@/payment-methods/infrastructure/adapters/payment-method-api.adapter";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { IPaymentMethod } from "@/payment-methods/domain/entities/IPaymentMethod";

export class PaymentMethodService implements IPaymentMethodService {
	private static instance: PaymentMethodService;

	constructor(
		private readonly paymentMethodRepository: IPaymentMethodRepository,
		private readonly paymentMethodUtils: PaymentMethodUtilsService
	) {}

	public static getInstance(
		paymentMethodRepository: IPaymentMethodRepository,
		paymentMethodUtils: PaymentMethodUtilsService
	): PaymentMethodService {
		if (!PaymentMethodService.instance) {
			PaymentMethodService.instance = new PaymentMethodService(
				paymentMethodRepository,
				paymentMethodUtils
			);
		}
		return PaymentMethodService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const paymentMethods = await this.paymentMethodRepository.findAll();
		return c.json(
			{
				success: true,
				data: PaymentMethodApiAdapter.toApiResponseList(paymentMethods),
				message: "Payment methods retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const paymentMethod = await this.paymentMethodRepository.findById(
			Number(id)
		);

		if (!paymentMethod) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Payment method not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: PaymentMethodApiAdapter.toApiResponse(paymentMethod),
				message: "Payment method retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserId = createHandler<ListByUserRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.paymentMethodUtils.validateUser(
			Number(userId)
		);
		if (!userValidation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const paymentMethods = await this.paymentMethodRepository.findByUserId(
			Number(userId)
		);
		return c.json(
			{
				success: true,
				data: PaymentMethodApiAdapter.toApiResponseList(paymentMethods),
				message: "User payment methods retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getSharedWithUser = createHandler<ListSharedRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.paymentMethodUtils.validateUser(
			Number(userId)
		);
		if (!userValidation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: "User not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const paymentMethods =
			await this.paymentMethodRepository.findSharedWithUser(Number(userId));
		return c.json(
			{
				success: true,
				data: PaymentMethodApiAdapter.toApiResponseList(paymentMethods),
				message: "Shared payment methods retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");

		if (data.shared_user_id) {
			const userValidation = await this.paymentMethodUtils.validateUser(
				data.shared_user_id
			);
			if (!userValidation.isValid) {
				return c.json(
					{
						success: false,
						data: null,
						message: "Shared user not found",
					},
					HttpStatusCodes.BAD_REQUEST
				);
			}
		}

		const paymentMethod = await this.paymentMethodRepository.create({
			userId: data.user_id,
			sharedUserId: data.shared_user_id || null,
			name: data.name,
			type: data.type,
			lastFourDigits: data.last_four_digits || null,
		});

		return c.json(
			{
				success: true,
				data: PaymentMethodApiAdapter.toApiResponse(paymentMethod),
				message: "Payment method created successfully",
			},
			HttpStatusCodes.CREATED
		);
	});

	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");

		const paymentMethod = await this.paymentMethodRepository.findById(
			Number(id)
		);
		if (!paymentMethod) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Payment method not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		if (data.shared_user_id !== undefined && data.shared_user_id !== null) {
			const validation = await this.paymentMethodUtils.validateSharing(
				Number(id),
				paymentMethod.userId,
				data.shared_user_id
			);

			if (!validation.isValid) {
				return c.json(
					{
						success: false,
						data: null,
						message: validation.message || "Invalid sharing configuration",
					},
					HttpStatusCodes.BAD_REQUEST
				);
			}
		}

		if (data.type && (data.type === "CARD" || data.type === "BANK_ACCOUNT")) {
			if (!data.last_four_digits && !paymentMethod.lastFourDigits) {
				return c.json(
					{
						success: false,
						data: null,
						message:
							"Last four digits are required for CARD and BANK_ACCOUNT types",
					},
					HttpStatusCodes.BAD_REQUEST
				);
			}
		}

		console.log("data", data);

		const updateData: Partial<IPaymentMethod> = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.type !== undefined) updateData.type = data.type;
		if (data.last_four_digits !== undefined && data.last_four_digits !== null)
			updateData.lastFourDigits = data.last_four_digits;

		if (data.shared_user_id !== undefined && data.shared_user_id !== null)
			updateData.sharedUserId = data.shared_user_id;

		if (data.type == "CASH") {
			updateData.lastFourDigits = null;
		}

		const updatedPaymentMethod = await this.paymentMethodRepository.update(
			Number(id),
			updateData
		);

		return c.json(
			{
				success: true,
				data: PaymentMethodApiAdapter.toApiResponse(updatedPaymentMethod),
				message: "Payment method updated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const paymentMethod = await this.paymentMethodRepository.findById(
			Number(id)
		);

		if (!paymentMethod) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Payment method not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.paymentMethodRepository.delete(Number(id));
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "Payment method deleted successfully",
			},
			HttpStatusCodes.OK
		);
	});
}
