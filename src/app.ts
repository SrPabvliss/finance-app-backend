import index from "./core/infrastructure/index.route";
import createApp from "./core/infrastructure/lib/create-app";
import configureOpenAPI from "./core/infrastructure/lib/configure-open-api";

const app = createApp();

configureOpenAPI(app);

const routes = [index] as const;

routes.forEach((route) => {
	app.route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
