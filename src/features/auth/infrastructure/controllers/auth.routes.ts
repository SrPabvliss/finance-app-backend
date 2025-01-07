import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";
import {
	authResponseSchema,
	loginSchema,
	registerSchema,
} from "../../application/dtos/auth.dto";
import { z } from "zod";

const tags = ["Authentication"];

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

export const login = createRoute({
	path: "/auth/login",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(loginSchema, "Login credentials"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(authResponseSchema),
				},
			},
			description: "Login successful",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid credentials",
		},
	},
});

export const register = createRoute({
	path: "/auth/register",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(registerSchema, "Registration data"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(authResponseSchema),
				},
			},
			description: "Registration successful",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid registration data",
		},
		[HttpStatusCodes.CONFLICT]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Email or username already exists",
		},
	},
});

export type LoginRoute = typeof login;
export type RegisterRoute = typeof register;
