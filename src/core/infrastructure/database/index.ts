import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "@/env";
import * as schema from "./schema";

export class DatabaseConnection {
	private static instance: DatabaseConnection;
	private pool: Pool;
	private drizzleInstance: ReturnType<typeof drizzle>;
	private isClosing: boolean = false;

	private constructor() {
		this.pool = new Pool({
			host: "localhost",
			port: env.DATABASE_PORT,
			user: env.DATABASE_USERNAME,
			password: env.DATABASE_PASSWORD,
			database: env.DATABASE_NAME,
			ssl: false,
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		this.drizzleInstance = drizzle(this.pool, { schema });

		this.pool.on("error", (err) => {
			console.error("Unexpected error on idle client", err);
			process.exit(-1);
		});

		process.once("SIGINT", async () => {
			console.info("\nReceived SIGINT. Closing database connection...");
			await this.close();
			process.exit(0);
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

	public getPoolStatus(): string {
		return `Total: ${this.pool.totalCount} | Idle: ${this.pool.idleCount} | Waiting: ${this.pool.waitingCount}`;
	}

	public async close(): Promise<void> {
		if (this.isClosing) {
			return;
		}

		this.isClosing = true;

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
