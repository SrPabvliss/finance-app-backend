ALTER TABLE "scheduled_transaction_changes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shared_resource_users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shared_resources" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "scheduled_transaction_changes" CASCADE;--> statement-breakpoint
DROP TABLE "shared_resource_users" CASCADE;--> statement-breakpoint
DROP TABLE "shared_resources" CASCADE;--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP CONSTRAINT "scheduled_transactions_transaction_base_id_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "shared_user_id" integer;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "original_amount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "pending_amount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "shared_user_id" integer;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "shared_user_id" integer;--> statement-breakpoint
ALTER TABLE "scheduled_transactions" ADD COLUMN "next_execution_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "debt_id" integer;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_shared_user_id_users_id_fk" FOREIGN KEY ("shared_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_shared_user_id_users_id_fk" FOREIGN KEY ("shared_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_shared_user_id_users_id_fk" FOREIGN KEY ("shared_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN "exceeded_alert";--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN "is_shared";--> statement-breakpoint
ALTER TABLE "debts" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "debts" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "friends" DROP COLUMN "connection_status";--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "goals" DROP COLUMN "is_shared";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "issuer";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "active";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "is_shared";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "transaction_base_id";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "last_execution";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "next_execution";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "frequency_type";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "repetition_limit";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "repetitions_done";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "scheduled_transactions" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "is_scheduled";