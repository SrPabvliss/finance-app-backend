import { createRouter } from "@/core/infrastructure/lib/create-app";
import * as routes from "./debt.routes";
import { PgUserRepository } from "@/users/infrastructure/adapters/user.repository";
import { PgTransactionRepository } from "@/transactions/infrastructure/adapters/transaction.repository";
import { DebtUtilsService } from "@/debts/application/services/debt-utils.service";
import { DebtService } from "@/debts/application/services/debt.service";
import { PgDebtRepository } from "../adapters/debt.repository";

const userRepository = PgUserRepository.getInstance();
const transactionRepository = PgTransactionRepository.getInstance();
const debtRepository = PgDebtRepository.getInstance();

const debtUtils = DebtUtilsService.getInstance(
	debtRepository,
	userRepository,
	transactionRepository
);

const debtService = DebtService.getInstance(
	debtRepository,
	transactionRepository,
	debtUtils
);

const router = createRouter()
	.openapi(routes.list, debtService.getAll)
	.openapi(routes.getById, debtService.getById)
	.openapi(routes.listByUser, debtService.getByUserId)
	.openapi(routes.listByCreditor, debtService.getByCreditorId)
	.openapi(routes.create, debtService.create)
	.openapi(routes.update, debtService.update)
	.openapi(routes.delete_, debtService.delete)
	.openapi(routes.payDebt, debtService.payDebt);

export default router;
