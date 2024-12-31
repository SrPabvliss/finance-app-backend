import { ITransactionRepository } from "@/transactions/domain/ports/transaction-repository.port";
import { ITransactionService } from "@/transactions/domain/ports/transaction-service.port";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import { TransactionApiAdapter } from "@/transactions/infrastructure/adapters/transaction-api.adapter";
import * as HttpStatusCodes from "stoker/http-status-codes";
import {
	CreateRoute,
	DeleteRoute,
	FilterTransactionsRoute,
	GetByIdRoute,
	GetCategoryTotalsRoute,
	GetMonthlyBalanceRoute,
	ListByUserRoute,
	ListRoute,
	UpdateRoute,
} from "@/transactions/infrastructure/controllers/transaction.routes";
import { TransactionUtilsService } from "./transactions-utils.service";

export class TransactionService implements ITransactionService {
	private static instance: TransactionService;

	constructor(
		private readonly transactionRepository: ITransactionRepository,
		private readonly transactionUtils: TransactionUtilsService
	) {}

	public static getInstance(
		transactionRepository: ITransactionRepository,
		transactionUtils: TransactionUtilsService
	): TransactionService {
		if (!TransactionService.instance) {
			TransactionService.instance = new TransactionService(
				transactionRepository,
				transactionUtils
			);
		}
		return TransactionService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const transactions = await this.transactionRepository.findAll();
		return c.json(
			{
				success: true,
				data: TransactionApiAdapter.toApiResponseList(transactions),
				message: "Transactions retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const transaction = await this.transactionRepository.findById(Number(id));

		if (!transaction) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Transaction not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: TransactionApiAdapter.toApiResponse(transaction),
				message: "Transaction retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserId = createHandler<ListByUserRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.transactionUtils.validateUser(
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

		const transactions = await this.transactionRepository.findByUserId(
			Number(userId)
		);
		return c.json(
			{
				success: true,
				data: TransactionApiAdapter.toApiResponseList(transactions),
				message: "User transactions retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getFiltered = createHandler<FilterTransactionsRoute>(async (c) => {
		const userId = c.req.param("userId");
		const filters = c.req.valid("query");

		const userValidation = await this.transactionUtils.validateUser(
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

		const transactions = await this.transactionRepository.findByFilters(
			Number(userId),
			filters
		);

		return c.json(
			{
				success: true,
				data: TransactionApiAdapter.toApiResponseList(transactions),
				message: "Filtered transactions retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");

		// Validar que el usuario existe
		const userValidation = await this.transactionUtils.validateUser(
			data.user_id
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

		// Si se proporciona un método de pago, validar que existe y pertenece al usuario
		if (data.payment_method_id) {
			const paymentMethodValidation =
				await this.transactionUtils.validatePaymentMethod(
					data.payment_method_id,
					data.user_id
				);
			if (!paymentMethodValidation.isValid) {
				return c.json(
					{
						success: false,
						data: null,
						message:
							paymentMethodValidation.message || "Invalid payment method",
					},
					HttpStatusCodes.BAD_REQUEST
				);
			}
		}

		const transaction = await this.transactionRepository.create({
			userId: data.user_id,
			amount: data.amount,
			type: data.type,
			category: data.category,
			description: data.description,
			paymentMethodId: data.payment_method_id,
			scheduledTransactionId: data.scheduled_transaction_id,
			debtId: data.debt_id,
		});

		return c.json(
			{
				success: true,
				data: TransactionApiAdapter.toApiResponse(transaction),
				message: "Transaction created successfully",
			},
			HttpStatusCodes.CREATED
		);
	});

	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");

		const transaction = await this.transactionRepository.findById(Number(id));
		if (!transaction) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Transaction not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		// Si se está actualizando el método de pago, validar que existe y pertenece al usuario
		if (data.payment_method_id !== undefined) {
			if (data.payment_method_id !== null) {
				const paymentMethodValidation =
					await this.transactionUtils.validatePaymentMethod(
						data.payment_method_id,
						transaction.userId
					);
				if (!paymentMethodValidation.isValid) {
					return c.json(
						{
							success: false,
							data: null,
							message:
								paymentMethodValidation.message || "Invalid payment method",
						},
						HttpStatusCodes.BAD_REQUEST
					);
				}
			}
		}

		const updatedTransaction = await this.transactionRepository.update(
			Number(id),
			{
				amount: data.amount,
				type: data.type,
				category: data.category,
				description: data.description,
				paymentMethodId: data.payment_method_id,
				scheduledTransactionId: data.scheduled_transaction_id,
				debtId: data.debt_id,
			}
		);

		return c.json(
			{
				success: true,
				data: TransactionApiAdapter.toApiResponse(updatedTransaction),
				message: "Transaction updated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const transaction = await this.transactionRepository.findById(Number(id));

		if (!transaction) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Transaction not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.transactionRepository.delete(Number(id));
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "Transaction deleted successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getMonthlyBalance = createHandler<GetMonthlyBalanceRoute>(async (c) => {
		const userId = c.req.param("userId");
		const { month } = c.req.valid("query");

		const userValidation = await this.transactionUtils.validateUser(
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

		const balance = await this.transactionRepository.getMonthlyBalance(
			Number(userId),
			new Date(month)
		);

		return c.json(
			{
				success: true,
				data: balance,
				message: "Monthly balance retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getCategoryTotals = createHandler<GetCategoryTotalsRoute>(async (c) => {
		const userId = c.req.param("userId");
		const { startDate, endDate } = c.req.valid("query");

		const userValidation = await this.transactionUtils.validateUser(
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

		const totals = await this.transactionRepository.getCategoryTotals(
			Number(userId),
			new Date(startDate),
			new Date(endDate)
		);

		return c.json(
			{
				success: true,
				data: totals,
				message: "Category totals retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});
}
