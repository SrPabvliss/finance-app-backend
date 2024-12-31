import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";
import {
	createPaymentMethodSchema,
	selectPaymentMethodSchema,
	updatePaymentMethodSchema,
} from "../../application/dtos/payment-method.dto";

const tags = ["Payment Methods"];

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
	path: "/payment-methods",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectPaymentMethodSchema)),
				},
			},
			description: "Payment methods retrieved successfully",
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
	path: "/payment-methods",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(
			createPaymentMethodSchema,
			"Payment method creation data"
		),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectPaymentMethodSchema),
				},
			},
			description: "Payment method created successfully",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid payment method data",
		},
		[HttpStatusCodes.CONFLICT]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Payment method already exists",
		},
	},
});

export const update = createRoute({
	path: "/payment-methods/:id",
	method: "patch",
	tags,
	request: {
		body: jsonContentRequired(
			updatePaymentMethodSchema,
			"Payment method update data"
		),
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectPaymentMethodSchema),
				},
			},
			description: "Payment method updated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Payment method not found",
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
	path: "/payment-methods/:id",
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
			description: "Payment method deleted successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Payment method not found",
		},
	},
});

export const getById = createRoute({
	path: "/payment-methods/:id",
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
					schema: baseResponseSchema(selectPaymentMethodSchema),
				},
			},
			description: "Payment method retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Payment method not found",
		},
	},
});

export const listByUser = createRoute({
	path: "/users/:userId/payment-methods",
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
					schema: baseResponseSchema(z.array(selectPaymentMethodSchema)),
				},
			},
			description: "User payment methods retrieved successfully",
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
	path: "/users/:userId/shared-payment-methods",
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
					schema: baseResponseSchema(z.array(selectPaymentMethodSchema)),
				},
			},
			description: "Shared payment methods retrieved successfully",
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

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof delete_;
export type GetByIdRoute = typeof getById;
export type ListByUserRoute = typeof listByUser;
export type ListSharedRoute = typeof listShared;
