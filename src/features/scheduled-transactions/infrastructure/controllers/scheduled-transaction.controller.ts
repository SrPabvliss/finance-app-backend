import { createRouter } from "@/core/infrastructure/lib/create-app";
import { PgUserRepository } from "@/users/infrastructure/adapters/user.repository";
import { PgPaymentMethodRepository } from "@/payment-methods/infrastructure/adapters/payment-method.repository";
import { PgTransactionRepository } from "@/transactions/infrastructure/adapters/transaction.repository";
import { ScheduledTransactionUtilsService } from "@/scheduled-transactions/application/services/scheduled-transaction-utils.service";
import { ScheduledTransactionService } from "@/scheduled-transactions/application/services/scheduled-transaction.service";
import { PgScheduledTransactionRepository } from "../adapters/scheduled-transaction.repositry";
import * as routes from "./scheduled-transaction.routes";

const userRepository = PgUserRepository.getInstance();
const paymentMethodRepository = PgPaymentMethodRepository.getInstance();
const transactionRepository = PgTransactionRepository.getInstance();
const scheduledTransactionRepository =
	PgScheduledTransactionRepository.getInstance();

const scheduledTransactionUtils = ScheduledTransactionUtilsService.getInstance(
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

const router = createRouter()
	.openapi(routes.list, scheduledTransactionService.getAll)
	.openapi(routes.create, scheduledTransactionService.create)
	.openapi(routes.update, scheduledTransactionService.update)
	.openapi(routes.delete_, scheduledTransactionService.delete)
	.openapi(routes.getById, scheduledTransactionService.getById)
	.openapi(routes.listByUser, scheduledTransactionService.getByUserId)
	.openapi(
		routes.findPendingExecutions,
		scheduledTransactionService.findPendingExecutions
	);

export default router;
