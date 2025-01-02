import { IDebtRepository } from "@/debts/domain/ports/debt-repository.port";
import { DebtUtilsService } from "./debt-utils.service";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { ITransactionRepository } from "@/transactions/domain/ports/transaction-repository.port";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByCreditorRoute,
	ListByUserRoute,
	ListRoute,
	PayDebtRoute,
	UpdateRoute,
} from "@/debts/infrastructure/controllers/debt.routes";
import { IDebtService } from "@/debts/domain/ports/debt-service.port";
import { DebtApiAdapter } from "@/debts/infrastructure/adapters/debt-api.adapter";
import { IDebt } from "@/debts/domain/entities/IDebt";

export class DebtService implements IDebtService {
	private static instance: DebtService;

	constructor(
		private readonly debtRepository: IDebtRepository,
		private readonly transactionRepository: ITransactionRepository,
		private readonly debtUtils: DebtUtilsService
	) {}

	public static getInstance(
		debtRepository: IDebtRepository,
		transactionRepository: ITransactionRepository,
		debtUtils: DebtUtilsService
	): DebtService {
		if (!DebtService.instance) {
			DebtService.instance = new DebtService(
				debtRepository,
				transactionRepository,
				debtUtils
			);
		}
		return DebtService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const debts = await this.debtRepository.findAll();
		return c.json(
			{
				success: true,
				data: DebtApiAdapter.toApiResponseList(debts),
				message: "Debts retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const debt = await this.debtRepository.findById(Number(id));

		if (!debt) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Debt not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: DebtApiAdapter.toApiResponse(debt),
				message: "Debt retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserId = createHandler<ListByUserRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.debtUtils.validateUser(Number(userId));
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

		const debts = await this.debtRepository.findByUserId(Number(userId));
		return c.json(
			{
				success: true,
				data: DebtApiAdapter.toApiResponseList(debts),
				message: "User debts retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByCreditorId = createHandler<ListByCreditorRoute>(async (c) => {
		const creditorId = c.req.param("creditorId");

		const userValidation = await this.debtUtils.validateUser(
			Number(creditorId)
		);
		if (!userValidation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Creditor not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const debts = await this.debtRepository.findByCreditorId(
			Number(creditorId)
		);
		return c.json(
			{
				success: true,
				data: DebtApiAdapter.toApiResponseList(debts),
				message: "Creditor debts retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");

		// Validar que el usuario existe
		const userValidation = await this.debtUtils.validateUser(data.user_id);
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

		// Validar acreedor solo si se proporciona
		if (data.creditor_id) {
			const creditorValidation = await this.debtUtils.validateUser(
				data.creditor_id
			);
			if (!creditorValidation.isValid) {
				return c.json(
					{
						success: false,
						data: null,
						message: "Creditor not found",
					},
					HttpStatusCodes.NOT_FOUND
				);
			}
		}

		const debt = await this.debtRepository.create({
			userId: data.user_id,
			description: data.description,
			originalAmount: Number(data.original_amount),
			pendingAmount: Number(data.original_amount),
			dueDate: new Date(data.due_date),
			paid: false,
			creditorId: data.creditor_id || null,
		});

		return c.json(
			{
				success: true,
				data: DebtApiAdapter.toApiResponse(debt),
				message: "Debt created successfully",
			},
			HttpStatusCodes.CREATED
		);
	});
	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");

		const debt = await this.debtRepository.findById(Number(id));
		if (!debt) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Debt not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const updateData: Partial<IDebt> = {};

		if (data.description !== undefined)
			updateData.description = data.description;
		if (data.pending_amount !== undefined)
			updateData.pendingAmount = Number(data.pending_amount);
		if (data.due_date !== undefined)
			updateData.dueDate = new Date(data.due_date);
		if (data.paid !== undefined) updateData.paid = data.paid;

		const updatedDebt = await this.debtRepository.update(
			Number(id),
			updateData
		);

		return c.json(
			{
				success: true,
				data: DebtApiAdapter.toApiResponse(updatedDebt),
				message: "Debt updated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const debt = await this.debtRepository.findById(Number(id));

		if (!debt) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Debt not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.debtRepository.delete(Number(id));
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "Debt deleted successfully",
			},
			HttpStatusCodes.OK
		);
	});

	payDebt = createHandler<PayDebtRoute>(async (c) => {
		const id = c.req.param("id");
		const userId = c.req.param("userId");
		const { amount } = c.req.valid("json");

		const validation = await this.debtUtils.validateDebt(
			Number(id),
			Number(userId),
			amount
		);

		if (!validation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: validation.message || "Invalid payment",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		const debt = validation.debt!;

		// Crear la transacción de pago
		await this.transactionRepository.create({
			userId: Number(userId),
			amount: amount,
			type: "EXPENSE",
			category: "DEBT_PAYMENT",
			description: `Payment for debt: ${debt.description}`,
			debtId: debt.id,
		});

		// Actualizar el monto pendiente
		const updatedDebt = await this.debtRepository.updatePendingAmount(
			debt.id,
			amount
		);

		return c.json(
			{
				success: true,
				data: DebtApiAdapter.toApiResponse(updatedDebt),
				message: "Debt payment processed successfully",
			},
			HttpStatusCodes.OK
		);
	});
}
