import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
	createTransactionSchema,
	selectTransactionSchema,
	updateTransactionSchema,
	transactionFiltersSchema,
} from "../../application/dtos/transaction.dto";

const tags = ["Transactions"];

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
	path: "/transactions",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectTransactionSchema)),
				},
			},
			description: "Transactions retrieved successfully",
		},
	},
});

export const getById = createRoute({
	path: "/transactions/:id",
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
					schema: baseResponseSchema(selectTransactionSchema),
				},
			},
			description: "Transaction retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Transaction not found",
		},
	},
});

export const listByUser = createRoute({
	path: "/users/:userId/transactions",
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
					schema: baseResponseSchema(z.array(selectTransactionSchema)),
				},
			},
			description: "User transactions retrieved successfully",
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

export const filterTransactions = createRoute({
	path: "/users/:userId/transactions/filter",
	method: "get",
	tags,
	request: {
		params: z.object({
			userId: z.string().regex(/^\d+$/).transform(Number),
		}),
		query: transactionFiltersSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectTransactionSchema)),
				},
			},
			description: "Filtered transactions retrieved successfully",
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
	path: "/transactions",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(
			createTransactionSchema,
			"Transaction creation data"
		),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectTransactionSchema),
				},
			},
			description: "Transaction created successfully",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid transaction data",
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
	path: "/transactions/:id",
	method: "patch",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
		body: jsonContentRequired(
			updateTransactionSchema,
			"Transaction update data"
		),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectTransactionSchema),
				},
			},
			description: "Transaction updated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Transaction not found",
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
	path: "/transactions/:id",
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
			description: "Transaction deleted successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Transaction not found",
		},
	},
});

export const getMonthlyBalance = createRoute({
	path: "/users/:userId/balance/monthly",
	method: "get",
	tags,
	request: {
		params: z.object({
			userId: z.string().regex(/^\d+$/).transform(Number),
		}),
		query: z.object({
			month: z.string().date(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(
						z.object({
							totalIncome: z.number(),
							totalExpense: z.number(),
							balance: z.number(),
						})
					),
				},
			},
			description: "Monthly balance retrieved successfully",
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

export const getCategoryTotals = createRoute({
	path: "/users/:userId/totals/category",
	method: "get",
	tags,
	request: {
		params: z.object({
			userId: z.string().regex(/^\d+$/).transform(Number),
		}),
		query: z.object({
			startDate: z.string().date(),
			endDate: z.string().date(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(
						z.array(
							z.object({
								category: z.string(),
								total: z.number(),
							})
						)
					),
				},
			},
			description: "Category totals retrieved successfully",
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

export const getMonthlyTrends = createRoute({
	path: "/users/:userId/trends/monthly",
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
					schema: baseResponseSchema(
						z.array(
							z.object({
								month: z.string(),
								income: z.number(),
								expense: z.number(),
							})
						)
					),
				},
			},
			description: "Monthly trends retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
		[HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Error retrieving monthly trends",
		},
	},
});

export type ListRoute = typeof list;
export type GetByIdRoute = typeof getById;
export type ListByUserRoute = typeof listByUser;
export type FilterTransactionsRoute = typeof filterTransactions;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof delete_;
export type GetMonthlyBalanceRoute = typeof getMonthlyBalance;
export type GetCategoryTotalsRoute = typeof getCategoryTotals;
export type GetMonthlyTrendsRoute = typeof getMonthlyTrends;
