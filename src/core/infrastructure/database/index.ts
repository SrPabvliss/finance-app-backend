import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "@/env";
import * as schema from "./schema";


export class DatabaseConnection {
	private static instance: DatabaseConnection;
	private pool: Pool;
	private drizzleInstance: ReturnType<typeof drizzle>;

	private constructor() {
		this.pool = new Pool({
			host: "localhost",
			port: env.DATABASE_PORT,
			user: env.DATABASE_USERNAME,
			password: env.DATABASE_PASSWORD,
			database: env.DATABASE_NAME,
      ssl: false
		});

		this.drizzleInstance = drizzle(this.pool, { schema });

		this.pool.on("error", (err) => {
			console.error("Unexpected error on idle client", err);
			process.exit(-1);
		});
	}

	public static getInstance(): DatabaseConnection {
		if (!DatabaseConnection.instance) {
			DatabaseConnection.instance = new DatabaseConnection();
		}
		return DatabaseConnection.instance;
	}

	public get db() {
		return this.drizzleInstance;
	}

	public async checkConnection(): Promise<boolean> {
		try {
			const client = await this.pool.connect();
			await client.query("SELECT NOW()");
			client.release();
			console.info("Database connection successful at", env.DATABASE_URL);
			return true;
		} catch (error) {
			console.error("❌ Database connection failed:", error);
			throw error;
		}
	}

	public async close(): Promise<void> {
		try {
			await this.pool.end();
			console.info("✅ Database connection closed successfully");
		} catch (error) {
			console.error("❌ Error closing database connection:", error);
			throw error;
		}
	}
}

export const db = DatabaseConnection.getInstance().db;

export default DatabaseConnection;
