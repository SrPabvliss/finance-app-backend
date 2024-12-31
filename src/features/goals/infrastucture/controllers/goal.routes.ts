import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
	createGoalSchema,
	selectGoalSchema,
	updateGoalSchema,
	updateProgressSchema,
} from "@/goals/application/dtos/goal.dto";

const tags = ["Goals"];

const baseResponseSchema = <T extends z.ZodType>(schema: T) =>
	z.object({
		success: z.boolean(),
		data: schema,
		message: z.string(),
	});

const errorResponseSchema = z.object({
	success: z.boolean(),
	data: z.null(),
	message: z.string(),
});

export const list = createRoute({
	path: "/goals",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectGoalSchema)),
				},
			},
			description: "Goals retrieved successfully",
		},
		[HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Internal server error",
		},
	},
});

export const create = createRoute({
	path: "/goals",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(createGoalSchema, "Goal creation data"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectGoalSchema),
				},
			},
			description: "Goal created successfully",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid goal data",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
	},
});

export const update = createRoute({
	path: "/goals/:id",
	method: "patch",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
		body: jsonContentRequired(updateGoalSchema, "Goal update data"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectGoalSchema),
				},
			},
			description: "Goal updated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Goal not found",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid update data",
		},
	},
});

export const delete_ = createRoute({
	path: "/goals/:id",
	method: "delete",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.object({ deleted: z.boolean() })),
				},
			},
			description: "Goal deleted successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Goal not found",
		},
	},
});

export const getById = createRoute({
	path: "/goals/:id",
	method: "get",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectGoalSchema),
				},
			},
			description: "Goal retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Goal not found",
		},
	},
});

export const listByUser = createRoute({
	path: "/users/:userId/goals",
	method: "get",
	tags,
	request: {
		params: z.object({
			userId: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectGoalSchema)),
				},
			},
			description: "User goals retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
	},
});

export const listShared = createRoute({
	path: "/users/:userId/shared-goals",
	method: "get",
	tags,
	request: {
		params: z.object({
			userId: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectGoalSchema)),
				},
			},
			description: "Shared goals retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
	},
});

export const updateProgress = createRoute({
	path: "/goals/:id/users/:userId/progress",
	method: "post",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
			userId: z.string().regex(/^\d+$/).transform(Number),
		}),
		body: jsonContent(updateProgressSchema, "Progress update data"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectGoalSchema),
				},
			},
			description: "Goal progress updated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Goal not found",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid progress update",
		},
	},
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof delete_;
export type GetByIdRoute = typeof getById;
export type ListByUserRoute = typeof listByUser;
export type ListSharedRoute = typeof listShared;
export type UpdateProgressRoute = typeof updateProgress;
