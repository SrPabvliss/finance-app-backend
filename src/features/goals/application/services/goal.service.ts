import { IGoalRepository } from "@/goals/domain/ports/goal-repository.port";
import { IGoalService } from "@/goals/domain/ports/goal-service.port";
import { GoalUtilsService } from "./goal-utils.service";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import * as HttpStatusCodes from "stoker/http-status-codes";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByUserRoute,
	ListRoute,
	ListSharedRoute,
	UpdateProgressRoute,
	UpdateRoute,
} from "@/goals/infrastucture/controllers/goal.routes";
import { GoalApiAdapter } from "@/goals/infrastucture/adapters/goal-api.adapter";

export class GoalService implements IGoalService {
	private static instance: GoalService;

	constructor(
		private readonly goalRepository: IGoalRepository,
		private readonly goalUtils: GoalUtilsService
	) {}

	public static getInstance(
		goalRepository: IGoalRepository,
		goalUtils: GoalUtilsService
	): GoalService {
		if (!GoalService.instance) {
			GoalService.instance = new GoalService(goalRepository, goalUtils);
		}
		return GoalService.instance;
	}

	getAll = createHandler<ListRoute>(async (c) => {
		const goals = await this.goalRepository.findAll();
		return c.json(
			{
				success: true,
				data: GoalApiAdapter.toApiResponseList(goals),
				message: "Goals retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getById = createHandler<GetByIdRoute>(async (c) => {
		const id = c.req.param("id");
		const goal = await this.goalRepository.findById(Number(id));

		if (!goal) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Goal not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		return c.json(
			{
				success: true,
				data: GoalApiAdapter.toApiResponse(goal),
				message: "Goal retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getByUserId = createHandler<ListByUserRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.goalUtils.validateUser(Number(userId));
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

		const goals = await this.goalRepository.findByUserId(Number(userId));
		return c.json(
			{
				success: true,
				data: GoalApiAdapter.toApiResponseList(goals),
				message: "User goals retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	getSharedWithUser = createHandler<ListSharedRoute>(async (c) => {
		const userId = c.req.param("userId");

		const userValidation = await this.goalUtils.validateUser(Number(userId));
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

		const goals = await this.goalRepository.findSharedWithUser(Number(userId));
		return c.json(
			{
				success: true,
				data: GoalApiAdapter.toApiResponseList(goals),
				message: "Shared goals retrieved successfully",
			},
			HttpStatusCodes.OK
		);
	});

	create = createHandler<CreateRoute>(async (c) => {
		const data = c.req.valid("json");

		// Validar usuario
		const userValidation = await this.goalUtils.validateUser(data.user_id);
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

		// Validar usuario compartido si existe
		if (data.shared_user_id) {
			const sharedUserValidation = await this.goalUtils.validateUser(
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

		const goal = await this.goalRepository.create({
			userId: data.user_id,
			sharedUserId: data.shared_user_id || null,
			name: data.name,
			targetAmount: Number(data.target_amount),
			currentAmount: Number(data.current_amount || 0),
			endDate: new Date(data.end_date),
		});

		return c.json(
			{
				success: true,
				data: GoalApiAdapter.toApiResponse(goal),
				message: "Goal created successfully",
			},
			HttpStatusCodes.CREATED
		);
	});

	update = createHandler<UpdateRoute>(async (c) => {
		const id = c.req.param("id");
		const data = c.req.valid("json");

		const goal = await this.goalRepository.findById(Number(id));
		if (!goal) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Goal not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		// Validar compartición si se está actualizando
		if (data.shared_user_id !== undefined) {
			if (data.shared_user_id !== null) {
				const validation = await this.goalUtils.validateSharing(
					Number(id),
					goal.userId,
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

		if (data.name !== undefined) updateData.name = data.name;
		if (data.target_amount !== undefined)
			updateData.targetAmount = Number(data.target_amount);
		if (data.current_amount !== undefined)
			updateData.currentAmount = Number(data.current_amount);
		if (data.end_date !== undefined)
			updateData.endDate = new Date(data.end_date);
		if (data.shared_user_id !== undefined)
			updateData.sharedUserId = data.shared_user_id;

		const updatedGoal = await this.goalRepository.update(
			Number(id),
			updateData
		);

		return c.json(
			{
				success: true,
				data: GoalApiAdapter.toApiResponse(updatedGoal),
				message: "Goal updated successfully",
			},
			HttpStatusCodes.OK
		);
	});

	delete = createHandler<DeleteRoute>(async (c) => {
		const id = c.req.param("id");
		const goal = await this.goalRepository.findById(Number(id));

		if (!goal) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Goal not found",
				},
				HttpStatusCodes.NOT_FOUND
			);
		}

		const deleted = await this.goalRepository.delete(Number(id));
		return c.json(
			{
				success: true,
				data: { deleted },
				message: "Goal deleted successfully",
			},
			HttpStatusCodes.OK
		);
	});

	updateProgress = createHandler<UpdateProgressRoute>(async (c) => {
		const id = c.req.param("id");
		const userId = c.req.param("userId");
		const { amount } = c.req.valid("json");

		const validation = await this.goalUtils.validateProgress(
			Number(id),
			Number(userId),
			amount
		);

		if (!validation.isValid) {
			return c.json(
				{
					success: false,
					data: null,
					message: validation.message || "Invalid progress update",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		const updatedGoal = await this.goalRepository.updateProgress(
			Number(id),
			amount
		);

		return c.json(
			{
				success: true,
				data: GoalApiAdapter.toApiResponse(updatedGoal),
				message: "Goal progress updated successfully",
			},
			HttpStatusCodes.OK
		);
	});
}
