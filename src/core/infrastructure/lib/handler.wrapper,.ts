import { RouteConfig } from "@hono/zod-openapi";
import { AppRouteHandler } from "../types/app-types";

export const createHandler = <R extends RouteConfig>(
	handler: AppRouteHandler<R>
): AppRouteHandler<R> => handler;
