import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { createRouter } from "./lib/create-app";

const router = createRouter().openapi(
	createRoute({
		tags: ["Index"],
		method: "get",
		path: "/",
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				createMessageObjectSchema("Hello World!"),
				"You have reached the root of the API"
			),
		},
	}),
	(c) => {
		return c.json(
			{
				message: "Hello World!",
			},
			HttpStatusCodes.OK
		);
	}
);

export default router;
