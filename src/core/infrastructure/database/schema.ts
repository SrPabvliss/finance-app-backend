import {
	pgTable,
	serial,
	varchar,
	timestamp,
	boolean,
	integer,
	decimal,
	text,
	date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name").notNull(),
	username: varchar("username").notNull().unique(),
	email: varchar("email").notNull().unique(),
	password_hash: varchar("password_hash").notNull(),
	registration_date: timestamp("registration_date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	active: boolean("active").default(true).notNull(),
	recovery_token: varchar("recovery_token"),
	recovery_token_expires: timestamp("recovery_token_expires"),
});

export const categories = pgTable("categories", {
	id: serial("id").primaryKey(),
	name: varchar("name").notNull(),
	description: text("description"),
});

export const payment_methods = pgTable("payment_methods", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	shared_user_id: integer("shared_user_id").references(() => users.id),
	name: varchar("name").notNull(),
	type: varchar("type").notNull(),
	last_four_digits: varchar("last_four_digits"),
});

export const transactions = pgTable("transactions", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	type: varchar("type").notNull(),
	category: varchar("category").references(() => categories.name),
	description: text("description"),
	payment_method_id: integer("payment_method_id").references(
		() => payment_methods.id
	),
	date: timestamp("date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	scheduled_transaction_id: integer("scheduled_transaction_id"),
	debt_id: integer("debt_id").references(() => debts.id),
	contribution_id: integer("contribution_id").references(() => goal_contributions.id),
});

export const goals = pgTable("goals", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	shared_user_id: integer("shared_user_id").references(() => users.id),
	name: varchar("name").notNull(),
	target_amount: decimal("target_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	current_amount: decimal("current_amount", { precision: 10, scale: 2 })
		.default("0")
		.notNull(),
	end_date: date("end_date").notNull(),
	contribution_frequency: integer("contribution_frequency").notNull(),
	contribution_amount: decimal("contribution_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	category: varchar("category").references(() => categories.name),
});

export const goal_contributions = pgTable("goal_contributions", {
	id: serial("id").primaryKey(),
	goal_id: integer("goal_id").references(() => goals.id),
	user_id: integer("user_id").references(() => users.id),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	date: timestamp("date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const budgets = pgTable("budgets", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	shared_user_id: integer("shared_user_id").references(() => users.id),
	category: varchar("category").references(() => categories.name),
	limit_amount: decimal("limit_amount", { precision: 10, scale: 2 }).notNull(),
	current_amount: decimal("current_amount", { precision: 10, scale: 2 })
		.default("0")
		.notNull(),
	month: date("month").notNull(),
});

export const scheduled_transactions = pgTable("scheduled_transactions", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	name: varchar("name").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	category: varchar("category").references(() => categories.name),
	description: text("description"),
	payment_method_id: integer("payment_method_id").references(
		() => payment_methods.id
	),
	frequency: varchar("frequency").notNull(),
	next_execution_date: date("next_execution_date").notNull(),
	active: boolean("active").default(true).notNull(),
});

export const friends = pgTable("friends", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	friend_id: integer("friend_id")
		.references(() => users.id)
		.notNull(),
	connection_date: timestamp("connection_date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const debts = pgTable("debts", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	description: text("description").notNull(),
	original_amount: decimal("original_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	pending_amount: decimal("pending_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	due_date: date("due_date").notNull(),
	paid: boolean("paid").default(false).notNull(),
	creditor_id: integer("creditor_id").references(() => users.id),
	category: varchar("category").references(() => categories.name),
});

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	title: varchar("title").notNull(),
	subtitle: varchar("subtitle"),
	message: text("message").notNull(),
	read: boolean("read").default(false).notNull(),
	type: varchar("type").notNull(),
	created_at: timestamp("created_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});
