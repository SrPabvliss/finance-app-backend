import { IBudgetRepository } from "@/budgets/domain/ports/budget-repository.port";
import { IBudgetService } from "@/budgets/domain/ports/budget-service.port";
import { BudgetUtilsService } from "./budget-utils.service";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import * as HttpStatusCodes from "stoker/http-status-codes";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByMonthRoute,
	ListByUserRoute,
	ListRoute,
	ListSharedRoute,
	UpdateAmountRoute,
	UpdateRoute,
} from "@/budgets/infrastructure/controllers/budget.routes";
import { BudgetApiAdapter } from "@/budgets/infrastructure/adapters/budget-api.adapter";

export class BudgetService implements IBudgetService {
	private static instance: BudgetService;

	constructor(
		private readonly budgetRepository: IBudgetRepository,
		private readonly budgetUtils: BudgetUtilsService
	) {}

	public static getInstance(
		budgetRepository: IBudgetRepository,
		budgetUtils: BudgetUtilsService
	): BudgetService {
		if (!BudgetService.instance) {
			BudgetService.instance = new BudgetService(budgetRepository, budgetUtils);
		}
		return BudgetService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const budgets = await this.budgetRepository.findAll();
		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponseList(budgets),
				message: "Budgets retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const budget = await this.budgetRepository.findById(Number(id));

		if (!budget) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Budget not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponse(budget),
				message: "Budget retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserId = createHandler<ListByUserRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.budgetUtils.validateUser(Number(userId));
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

		const budgets = await this.budgetRepository.findByUserId(Number(userId));
		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponseList(budgets),
				message: "User budgets retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserIdAndMonth = createHandler<ListByMonthRoute>(async (c) => {
		const userId = c.req.param("userId");
		const { month } = c.req.valid("query");

		const userValidation = await this.budgetUtils.validateUser(Number(userId));
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

		const budgets = await this.budgetRepository.findByUserIdAndMonth(
			Number(userId),
			new Date(month)
		);
		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponseList(budgets),
				message: "User budgets for month retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getSharedWithUser = createHandler<ListSharedRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.budgetUtils.validateUser(Number(userId));
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

		const budgets = await this.budgetRepository.findSharedWithUser(
			Number(userId)
		);
		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponseList(budgets),
				message: "Shared budgets retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");

		const userValidation = await this.budgetUtils.validateUser(data.user_id);
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

		if (data.shared_user_id) {
			const sharedUserValidation = await this.budgetUtils.validateUser(
				data.shared_user_id
			);
			if (!sharedUserValidation.isValid) {
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

		const budget = await this.budgetRepository.create({
			userId: data.user_id,
			sharedUserId: data.shared_user_id || null,
			category: data.category,
			limitAmount: Number(data.limit_amount),
			currentAmount: Number(data.current_amount || 0),
			month: new Date(data.month),
		});

		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponse(budget),
				message: "Budget created successfully",
			},
			HttpStatusCodes.CREATED
		);
	});

	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");

		const budget = await this.budgetRepository.findById(Number(id));
		if (!budget) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Budget not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		if (data.shared_user_id !== undefined) {
			if (data.shared_user_id !== null) {
				const validation = await this.budgetUtils.validateSharing(
					Number(id),
					budget.userId,
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
		}

		const updateData: Partial<any> = {};

		if (data.category !== undefined) updateData.category = data.category;
		if (data.limit_amount !== undefined)
			updateData.limitAmount = Number(data.limit_amount);
		if (data.current_amount !== undefined)
			updateData.currentAmount = Number(data.current_amount);
		if (data.month !== undefined) updateData.month = new Date(data.month);
		if (data.shared_user_id !== undefined)
			updateData.sharedUserId = data.shared_user_id;

		const updatedBudget = await this.budgetRepository.update(
			Number(id),
			updateData
		);

		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponse(updatedBudget),
				message: "Budget updated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const budget = await this.budgetRepository.findById(Number(id));

		if (!budget) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Budget not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.budgetRepository.delete(Number(id));
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "Budget deleted successfully",
			},
			HttpStatusCodes.OK
		);
	});

	updateAmount = createHandler<UpdateAmountRoute>(async (c) => {
		const id = c.req.param("id");
		const userId = c.req.param("userId");
		const { amount } = c.req.valid("json");

		const validation = await this.budgetUtils.validateAmount(
			Number(id),
			Number(userId),
			amount
		);

		if (!validation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: validation.message || "Invalid amount update",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		const updatedBudget = await this.budgetRepository.updateAmount(
			Number(id),
			amount
		);

		return c.json(
			{
				success: true,
				data: BudgetApiAdapter.toApiResponse(updatedBudget),
				message: "Budget amount updated successfully",
			},
			HttpStatusCodes.OK
		);
	});
}
