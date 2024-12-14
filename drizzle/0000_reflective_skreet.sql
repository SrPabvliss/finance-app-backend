CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" varchar NOT NULL,
	"limit_amount" numeric(10, 2) NOT NULL,
	"current_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"month" date NOT NULL,
	"exceeded_alert" boolean DEFAULT false NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"start_date" date NOT NULL,
	"due_date" date NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"creditor_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friends" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"connection_status" varchar NOT NULL,
	"connection_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"target_amount" numeric(10, 2) NOT NULL,
	"current_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"last_four_digits" varchar,
	"issuer" varchar,
	"active" boolean DEFAULT true NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"full_name" varchar,
	"profile_picture" varchar,
	"settings" json DEFAULT '{}'::json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_transaction_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheduled_transaction_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"change_type" varchar NOT NULL,
	"change_details" json NOT NULL,
	"change_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"transaction_base_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" varchar NOT NULL,
	"description" text,
	"payment_method_id" integer,
	"frequency" varchar NOT NULL,
	"last_execution" date,
	"next_execution" date NOT NULL,
	"frequency_type" varchar NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"repetition_limit" integer,
	"repetitions_done" integer DEFAULT 0 NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_resource_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"shared_resource_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar NOT NULL,
	"link_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_type" varchar NOT NULL,
	"resource_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"creation_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"type" varchar NOT NULL,
	"category" varchar NOT NULL,
	"description" text,
	"payment_method_id" integer,
	"date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_scheduled" boolean DEFAULT false NOT NULL,
	"scheduled_transaction_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"registration_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"recovery_token" varchar,
	"recovery_token_expires" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_creditor_id_users_id_fk" FOREIGN KEY ("creditor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_transaction_changes" ADD CONSTRAINT "scheduled_transaction_changes_scheduled_transaction_id_scheduled_transactions_id_fk" FOREIGN KEY ("scheduled_transaction_id") REFERENCES "public"."scheduled_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_transaction_changes" ADD CONSTRAINT "scheduled_transaction_changes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_transactions" ADD CONSTRAINT "scheduled_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_transactions" ADD CONSTRAINT "scheduled_transactions_transaction_base_id_transactions_id_fk" FOREIGN KEY ("transaction_base_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_transactions" ADD CONSTRAINT "scheduled_transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_resource_users" ADD CONSTRAINT "shared_resource_users_shared_resource_id_shared_resources_id_fk" FOREIGN KEY ("shared_resource_id") REFERENCES "public"."shared_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_resource_users" ADD CONSTRAINT "shared_resource_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_resources" ADD CONSTRAINT "shared_resources_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;