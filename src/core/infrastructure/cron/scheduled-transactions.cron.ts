import env from "@/env";
import { PgUserRepository } from "@/users/infrastructure/adapters/user.repository";
import { PgPaymentMethodRepository } from "@/payment-methods/infrastructure/adapters/payment-method.repository";
import { PgTransactionRepository } from "@/transactions/infrastructure/adapters/transaction.repository";
import { PgScheduledTransactionRepository } from "@/scheduled-transactions/infrastructure/adapters/scheduled-transaction.repositry";
import { ScheduledTransactionUtilsService } from "@/scheduled-transactions/application/services/scheduled-transaction-utils.service";
import { ScheduledTransactionService } from "@/scheduled-transactions/application/services/scheduled-transaction.service";

let isRunning = false;

export function startScheduledTransactionsJob() {
	const userRepository = PgUserRepository.getInstance();
	const paymentMethodRepository = PgPaymentMethodRepository.getInstance();
	const transactionRepository = PgTransactionRepository.getInstance();
	const scheduledTransactionRepository =
		PgScheduledTransactionRepository.getInstance();

	const scheduledTransactionUtils =
		ScheduledTransactionUtilsService.getInstance(
			scheduledTransactionRepository,
			userRepository,
			paymentMethodRepository,
			transactionRepository
		);

	const scheduledTransactionService = ScheduledTransactionService.getInstance(
		scheduledTransactionRepository,
		transactionRepository,
		scheduledTransactionUtils
	);

	async function checkScheduledTransactions() {
		if (isRunning) return;
		isRunning = true;

		console.log("Checking scheduled transactions");

		try {
			const scheduledTransactions =
				await scheduledTransactionRepository.findPendingExecutions();

			for (const scheduled of scheduledTransactions) {
				try {
					await scheduledTransactionService.executeScheduledTransaction(
						scheduled
					);
					console.info(`Executed scheduled transaction ${scheduled.id}`);
				} catch (error) {
					console.error(
						`Error executing scheduled transaction ${scheduled.id}:`,
						error
					);
				}
			}
		} catch (error) {
			console.error("Error checking scheduled transactions:", error);
		} finally {
			isRunning = false;
		}
	}

	const intervalMs = env.SCHEDULED_TRANSACTIONS_CHECK_INTERVAL * 1000;

	setInterval(checkScheduledTransactions, intervalMs);
	console.info(
		`Started scheduled transactions job (interval: ${env.SCHEDULED_TRANSACTIONS_CHECK_INTERVAL}s)`
	);
}
