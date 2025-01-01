import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import { ScheduledTransactionUtilsService } from "./scheduled-transaction-utils.service";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { ITransactionRepository } from "@/transactions/domain/ports/transaction-repository.port";
import { IScheduledTransactionService } from "@/scheduled-transactions/domain/ports/scheduled-transaction-service.port";
import { IScheduledTransactionRepository } from "@/scheduled-transactions/domain/ports/scheduled-transaction-repository.port";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByUserRoute,
	ListRoute,
	PendingExecutionsRoute,
	UpdateRoute,
} from "@/scheduled-transactions/infrastructure/controllers/scheduled-transaction.routes";
import { ScheduledTransactionApiAdapter } from "@/scheduled-transactions/infrastructure/adapters/scheduled-transaction-api.adapter";
import { Frequency } from "../dtos/scheduled-transaction.dto";

export class ScheduledTransactionService
	implements IScheduledTransactionService
{
	private static instance: ScheduledTransactionService;

	constructor(
		private readonly scheduledTransactionRepository: IScheduledTransactionRepository,
		private readonly transactionRepository: ITransactionRepository,
		private readonly scheduledTransactionUtils: ScheduledTransactionUtilsService
	) {}

	public static getInstance(
		scheduledTransactionRepository: IScheduledTransactionRepository,
		transactionRepository: ITransactionRepository,
		scheduledTransactionUtils: ScheduledTransactionUtilsService
	): ScheduledTransactionService {
		if (!ScheduledTransactionService.instance) {
			ScheduledTransactionService.instance = new ScheduledTransactionService(
				scheduledTransactionRepository,
				transactionRepository,
				scheduledTransactionUtils
			);
		}
		return ScheduledTransactionService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const scheduledTransactions =
			await this.scheduledTransactionRepository.findAll();
		return c.json(
			{
				success: true,
				data: ScheduledTransactionApiAdapter.toApiResponseList(
					scheduledTransactions
				),
				message: "Scheduled transactions retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const scheduledTransaction =
			await this.scheduledTransactionRepository.findById(Number(id));

		if (!scheduledTransaction) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Scheduled transaction not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: ScheduledTransactionApiAdapter.toApiResponse(
					scheduledTransaction
				),
				message: "Scheduled transaction retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserId = createHandler<ListByUserRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.scheduledTransactionUtils.validateUser(
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

		const scheduledTransactions =
			await this.scheduledTransactionRepository.findByUserId(Number(userId));
		return c.json(
			{
				success: true,
				data: ScheduledTransactionApiAdapter.toApiResponseList(
					scheduledTransactions
				),
				message: "User scheduled transactions retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");

		// Validar usuario
		const userValidation = await this.scheduledTransactionUtils.validateUser(
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
				await this.scheduledTransactionUtils.validatePaymentMethod(
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

		const scheduledTransaction =
			await this.scheduledTransactionRepository.create({
				userId: data.user_id,
				name: data.name,
				amount: data.amount,
				category: data.category,
				description: data.description,
				paymentMethodId: data.payment_method_id,
				frequency: data.frequency,
				nextExecutionDate: new Date(data.next_execution_date),
				active: data.active,
			});

		return c.json(
			{
				success: true,
				data: ScheduledTransactionApiAdapter.toApiResponse(
					scheduledTransaction
				),
				message: "Scheduled transaction created successfully",
			},
			HttpStatusCodes.CREATED
		);
	});

	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");

		const scheduledTransaction =
			await this.scheduledTransactionRepository.findById(Number(id));
		if (!scheduledTransaction) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Scheduled transaction not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		// Si se está actualizando el método de pago, validar
		if (data.payment_method_id !== undefined) {
			if (data.payment_method_id !== null) {
				const paymentMethodValidation =
					await this.scheduledTransactionUtils.validatePaymentMethod(
						data.payment_method_id,
						scheduledTransaction.userId
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

		const updateData: Partial<any> = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.amount !== undefined) updateData.amount = data.amount;
		if (data.category !== undefined) updateData.category = data.category;
		if (data.description !== undefined)
			updateData.description = data.description;
		if (data.payment_method_id !== undefined)
			updateData.paymentMethodId = data.payment_method_id;
		if (data.frequency !== undefined) updateData.frequency = data.frequency;
		if (data.next_execution_date !== undefined)
			updateData.nextExecutionDate = new Date(data.next_execution_date);
		if (data.active !== undefined) updateData.active = data.active;

		const updatedScheduledTransaction =
			await this.scheduledTransactionRepository.update(Number(id), updateData);

		return c.json(
			{
				success: true,
				data: ScheduledTransactionApiAdapter.toApiResponse(
					updatedScheduledTransaction
				),
				message: "Scheduled transaction updated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const scheduledTransaction =
			await this.scheduledTransactionRepository.findById(Number(id));

		if (!scheduledTransaction) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Scheduled transaction not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.scheduledTransactionRepository.delete(
			Number(id)
		);
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "Scheduled transaction deleted successfully",
			},
			HttpStatusCodes.OK
		);
	});

	findPendingExecutions = createHandler<PendingExecutionsRoute>(async (c) => {
		const scheduledTransactions =
			await this.scheduledTransactionRepository.findPendingExecutions();

		// Ejecutar las transacciones pendientes
		for (const scheduled of scheduledTransactions) {
			await this.executeScheduledTransaction(scheduled);
		}

		return c.json(
			{
				success: true,
				data: {
					executedCount: scheduledTransactions.length,
				},
				message: "Pending transactions executed successfully",
			},
			HttpStatusCodes.OK
		);
	});

	async executeScheduledTransaction(scheduled: any) {
		const shouldExecute = await this.scheduledTransactionUtils.shouldExecute(
			scheduled.id
		);
		if (!shouldExecute) {
			console.info(
				`Transaction ${scheduled.id} should not be executed yet or already executed today, skipping`
			);
			return null;
		}

		const transaction = await this.transactionRepository.create({
			userId: scheduled.userId,
			amount: scheduled.amount,
			type: "EXPENSE",
			category: scheduled.category,
			description: scheduled.description,
			paymentMethodId: scheduled.paymentMethodId,
			scheduledTransactionId: scheduled.id,
		});

		const nextDate = this.calculateNextExecutionDate(
			scheduled.nextExecutionDate,
			scheduled.frequency as Frequency
		);

		await this.scheduledTransactionRepository.update(scheduled.id, {
			nextExecutionDate: nextDate,
		});

		return transaction;
	}

	private calculateNextExecutionDate(
		currentDate: Date,
		frequency: Frequency
	): Date {
		const nextDate = new Date(currentDate);

		switch (frequency) {
			case "DAILY":
				nextDate.setDate(nextDate.getDate() + 1);
				break;
			case "WEEKLY":
				nextDate.setDate(nextDate.getDate() + 7);
				break;
			case "MONTHLY":
				nextDate.setMonth(nextDate.getMonth() + 1);
				break;
			case "YEARLY":
				nextDate.setFullYear(nextDate.getFullYear() + 1);
				break;
		}

		return nextDate;
	}
}
