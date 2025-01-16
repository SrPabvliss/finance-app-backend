// src/friends/infrastructure/controllers/friend.routes.ts
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
	createFriendSchema,
	FriendResponseSchema,
	selectFriendSchema,
} from "@/friends/application/dtos/friend.dto";

const tags = ["Friends"];

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
	path: "/friends",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(FriendResponseSchema)),
				},
			},
			description: "Friends retrieved successfully",
		},
	},
});

export const getById = createRoute({
	path: "/friends/:id",
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
					schema: baseResponseSchema(FriendResponseSchema),
				},
			},
			description: "Friend retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Friend not found",
		},
	},
});

export const listByUser = createRoute({
	path: "/users/:userId/friends",
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
					schema: baseResponseSchema(z.array(FriendResponseSchema)),
				},
			},
			description: "User friends retrieved successfully",
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
	path: "/friends",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(createFriendSchema, "Friend creation data"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(FriendResponseSchema),
				},
			},
			description: "Friend added successfully",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid friend data",
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

export const delete_ = createRoute({
	path: "/friends/:id",
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
			description: "Friend removed successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Friend not found",
		},
	},
});

export type ListRoute = typeof list;
export type GetByIdRoute = typeof getById;
export type ListByUserRoute = typeof listByUser;
export type CreateRoute = typeof create;
export type DeleteRoute = typeof delete_;
