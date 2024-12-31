import index from "./core/infrastructure/index.route";
import createApp from "./core/infrastructure/lib/create-app";
import configureOpenAPI from "./core/infrastructure/lib/configure-open-api";
import users from "@/users/infrastructure/controllers/user.controller";
import paymentMethods from "@/payment-methods/infrastructure/controllers/payment-method.controller";
import transactions from "@/transactions/infrastructure/controllers/transaction.controller";
import DatabaseConnection from "@/db";

const app = createApp();

configureOpenAPI(app);

const routes = [index, users, paymentMethods, transactions] as const;

app.get("/debug/db-status", (c) => {
	const db = DatabaseConnection.getInstance();
	return c.json({
		poolStatus: db.getPoolStatus(),
		timestamp: new Date().toISOString(),
	});
});

routes.forEach((route) => {
	app.route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
