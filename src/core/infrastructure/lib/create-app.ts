import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { pinoLogger } from "../middleware/pino-logger";
import { AppBindings, AppOpenAPI } from "../types/app-types";
import DatabaseConnection from "@/db";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		defaultHook,
	});
}

export default function createApp() {
	const app = createRouter();
	const dbConnection = DatabaseConnection.getInstance();
	dbConnection.checkConnection();
	app.use(serveEmojiFavicon("📝"));
	app.use(pinoLogger());

	app.notFound(notFound);
	app.onError(onError);
	return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
	return createApp().route("/", router);
}
