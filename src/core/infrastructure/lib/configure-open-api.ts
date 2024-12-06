import { apiReference } from "@scalar/hono-api-reference";

import { AppOpenAPI } from "../types/app-types";

export default function configureOpenAPI(app: AppOpenAPI) {
	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Finance App API",
		},
	});

	app.get(
		"/reference",
		apiReference({
			theme: "kepler",
			layout: "classic",
			defaultHttpClient: {
				targetKey: "javascript",
				clientKey: "fetch",
			},
			spec: {
				url: "/doc",
			},
		})
	);
}
