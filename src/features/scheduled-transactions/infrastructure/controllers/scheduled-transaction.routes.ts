import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
	createScheduledTransactionSchema,
	selectScheduledTransactionSchema,
	updateScheduledTransactionSchema,
} from "../../application/dtos/scheduled-transaction.dto";

const tags = ["Scheduled Transactions"];

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
	path: "/scheduled-transactions",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectScheduledTransactionSchema)),
				},
			},
			description: "Scheduled transactions retrieved successfully",
		},
	},
});

export const getById = createRoute({
	path: "/scheduled-transactions/:id",
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
					schema: baseResponseSchema(selectScheduledTransactionSchema),
				},
			},
			description: "Scheduled transaction retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Scheduled transaction not found",
		},
	},
});

export const listByUser = createRoute({
	path: "/users/:userId/scheduled-transactions",
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
					schema: baseResponseSchema(z.array(selectScheduledTransactionSchema)),
				},
			},
			description: "User scheduled transactions retrieved successfully",
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

export const create = createRoute({
	path: "/scheduled-transactions",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(
			createScheduledTransactionSchema,
			"Scheduled transaction creation data"
		),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectScheduledTransactionSchema),
				},
			},
			description: "Scheduled transaction created successfully",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid scheduled transaction data",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User or payment method not found",
		},
	},
});

export const update = createRoute({
	path: "/scheduled-transactions/:id",
	method: "patch",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
		body: jsonContentRequired(
			updateScheduledTransactionSchema,
			"Scheduled transaction update data"
		),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectScheduledTransactionSchema),
				},
			},
			description: "Scheduled transaction updated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Scheduled transaction not found",
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
	path: "/scheduled-transactions/:id",
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
			description: "Scheduled transaction deleted successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Scheduled transaction not found",
		},
	},
});

export const findPendingExecutions = createRoute({
	path: "/scheduled-transactions/pending",
	method: "post",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(
						z.object({
							executedCount: z.number(),
						})
					),
				},
			},
			description: "Pending transactions executed successfully",
		},
	},
});

export type ListRoute = typeof list;
export type GetByIdRoute = typeof getById;
export type ListByUserRoute = typeof listByUser;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof delete_;
export type PendingExecutionsRoute = typeof findPendingExecutions;
