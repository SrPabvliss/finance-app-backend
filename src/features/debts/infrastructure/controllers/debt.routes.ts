import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
	createDebtSchema,
	selectDebtSchema,
	updateDebtSchema,
	payDebtSchema,
} from "../../application/dtos/debt.dto";

const tags = ["Debts"];

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
	path: "/debts",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectDebtSchema)),
				},
			},
			description: "Debts retrieved successfully",
		},
	},
});

export const getById = createRoute({
	path: "/debts/:id",
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
					schema: baseResponseSchema(selectDebtSchema),
				},
			},
			description: "Debt retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Debt not found",
		},
	},
});

export const listByUser = createRoute({
	path: "/users/:userId/debts",
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
					schema: baseResponseSchema(z.array(selectDebtSchema)),
				},
			},
			description: "User debts retrieved successfully",
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

export const listByCreditor = createRoute({
	path: "/users/:creditorId/credits",
	method: "get",
	tags,
	request: {
		params: z.object({
			creditorId: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectDebtSchema)),
				},
			},
			description: "Creditor debts retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Creditor not found",
		},
	},
});

export const create = createRoute({
	path: "/debts",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(createDebtSchema, "Debt creation data"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectDebtSchema),
				},
			},
			description: "Debt created successfully",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid debt data",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User or creditor not found",
		},
	},
});

export const update = createRoute({
	path: "/debts/:id",
	method: "patch",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
		body: jsonContentRequired(updateDebtSchema, "Debt update data"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectDebtSchema),
				},
			},
			description: "Debt updated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Debt not found",
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
	path: "/debts/:id",
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
			description: "Debt deleted successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Debt not found",
		},
	},
});

export const payDebt = createRoute({
	path: "/debts/:id/users/:userId/pay",
	method: "post",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
			userId: z.string().regex(/^\d+$/).transform(Number),
		}),
		body: jsonContent(payDebtSchema, "Payment data"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectDebtSchema),
				},
			},
			description: "Debt payment processed successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Debt not found",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid payment",
		},
	},
});

export type ListRoute = typeof list;
export type GetByIdRoute = typeof getById;
export type ListByUserRoute = typeof listByUser;
export type ListByCreditorRoute = typeof listByCreditor;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof delete_;
export type PayDebtRoute = typeof payDebt;
