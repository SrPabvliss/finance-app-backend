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
	json,
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

export const profiles = pgTable("profiles", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	full_name: varchar("full_name"),
	profile_picture: varchar("profile_picture"),
	settings: json("settings").default({}).notNull(),
});

export const payment_methods = pgTable("payment_methods", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	name: varchar("name").notNull(),
	type: varchar("type").notNull(),
	last_four_digits: varchar("last_four_digits"),
	issuer: varchar("issuer"),
	active: boolean("active").default(true).notNull(),
	is_shared: boolean("is_shared").default(false).notNull(),
});

export const transactions = pgTable("transactions", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	type: varchar("type").notNull(),
	category: varchar("category").notNull(),
	description: text("description"),
	payment_method_id: integer("payment_method_id").references(
		() => payment_methods.id
	),
	date: timestamp("date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	is_scheduled: boolean("is_scheduled").default(false).notNull(),
	scheduled_transaction_id: integer("scheduled_transaction_id"),
});

export const goals = pgTable("goals", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	name: varchar("name").notNull(),
	target_amount: decimal("target_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	current_amount: decimal("current_amount", { precision: 10, scale: 2 })
		.default("0")
		.notNull(),
	start_date: date("start_date").notNull(),
	end_date: date("end_date").notNull(),
	status: varchar("status").notNull(),
	is_shared: boolean("is_shared").default(false).notNull(),
});

export const budgets = pgTable("budgets", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	category: varchar("category").notNull(),
	limit_amount: decimal("limit_amount", { precision: 10, scale: 2 }).notNull(),
	current_amount: decimal("current_amount", { precision: 10, scale: 2 })
		.default("0")
		.notNull(),
	month: date("month").notNull(),
	exceeded_alert: boolean("exceeded_alert").default(false).notNull(),
	is_shared: boolean("is_shared").default(false).notNull(),
});

export const scheduled_transactions = pgTable("scheduled_transactions", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	transaction_base_id: integer("transaction_base_id")
		.references(() => transactions.id)
		.notNull(),
	name: varchar("name").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	category: varchar("category").notNull(),
	description: text("description"),
	payment_method_id: integer("payment_method_id").references(
		() => payment_methods.id
	),
	frequency: varchar("frequency").notNull(),
	last_execution: date("last_execution"),
	next_execution: date("next_execution").notNull(),
	frequency_type: varchar("frequency_type").notNull(),
	active: boolean("active").default(true).notNull(),
	repetition_limit: integer("repetition_limit"),
	repetitions_done: integer("repetitions_done").default(0).notNull(),
	start_date: date("start_date").notNull(),
	end_date: date("end_date"),
	status: varchar("status").notNull(),
});

export const scheduled_transaction_changes = pgTable(
	"scheduled_transaction_changes",
	{
		id: serial("id").primaryKey(),
		scheduled_transaction_id: integer("scheduled_transaction_id")
			.references(() => scheduled_transactions.id)
			.notNull(),
		user_id: integer("user_id")
			.references(() => users.id)
			.notNull(),
		change_type: varchar("change_type").notNull(),
		change_details: json("change_details").notNull(),
		change_date: timestamp("change_date")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}
);

export const friends = pgTable("friends", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	friend_id: integer("friend_id")
		.references(() => users.id)
		.notNull(),
	connection_status: varchar("connection_status").notNull(),
	connection_date: timestamp("connection_date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const shared_resources = pgTable("shared_resources", {
	id: serial("id").primaryKey(),
	resource_type: varchar("resource_type").notNull(),
	resource_id: integer("resource_id").notNull(),
	creator_id: integer("creator_id")
		.references(() => users.id)
		.notNull(),
	creation_date: timestamp("creation_date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	active: boolean("active").default(true).notNull(),
});

export const shared_resource_users = pgTable("shared_resource_users", {
	id: serial("id").primaryKey(),
	shared_resource_id: integer("shared_resource_id")
		.references(() => shared_resources.id)
		.notNull(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	role: varchar("role").notNull(),
	link_date: timestamp("link_date")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const debts = pgTable("debts", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.references(() => users.id)
		.notNull(),
	description: text("description").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	start_date: date("start_date").notNull(),
	due_date: date("due_date").notNull(),
	paid: boolean("paid").default(false).notNull(),
	creditor_id: integer("creditor_id")
		.references(() => users.id)
		.notNull(),
});
