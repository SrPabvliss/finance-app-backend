import { createRouter } from "@/core/infrastructure/lib/create-app";
import * as routes from "./transaction.routes";
import { PgTransactionRepository } from "../adapters/transaction.repository";
import { PgUserRepository } from "@/users/infrastructure/adapters/user.repository";
import { PgPaymentMethodRepository } from "@/payment-methods/infrastructure/adapters/payment-method.repository";
import { TransactionUtilsService } from "@/transactions/application/services/transactions-utils.service";
import { TransactionService } from "@/transactions/application/services/transactions.service";

const userRepository = PgUserRepository.getInstance();
const paymentMethodRepository = PgPaymentMethodRepository.getInstance();
const transactionRepository = PgTransactionRepository.getInstance();

const transactionUtils = TransactionUtilsService.getInstance(
	transactionRepository,
	userRepository,
	paymentMethodRepository
);

const transactionService = TransactionService.getInstance(
	transactionRepository,
	transactionUtils
);

const router = createRouter()
	.openapi(routes.list, transactionService.getAll)
	.openapi(routes.getById, transactionService.getById)
	.openapi(routes.listByUser, transactionService.getByUserId)
	.openapi(routes.filterTransactions, transactionService.getFiltered)
	.openapi(routes.create, transactionService.create)
	.openapi(routes.update, transactionService.update)
	.openapi(routes.delete_, transactionService.delete)
	.openapi(routes.getMonthlyBalance, transactionService.getMonthlyBalance)
	.openapi(routes.getCategoryTotals, transactionService.getCategoryTotals)
	.openapi(routes.getMonthlyTrends, transactionService.getMonthlyTrends);

export default router;
