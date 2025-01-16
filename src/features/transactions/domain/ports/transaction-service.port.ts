import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import {
	CreateRoute,
	DeleteRoute,
	FilterTransactionsRoute,
	GetByIdRoute,
	GetCategoryTotalsRoute,
	GetMonthlyBalanceRoute,
	GetMonthlyTrendsRoute,
	ListByUserRoute,
	ListRoute,
	UpdateRoute,
} from "@/transactions/infrastructure/controllers/transaction.routes";

export interface ITransactionService {
	getAll: AppRouteHandler<ListRoute>;
	getById: AppRouteHandler<GetByIdRoute>;
	getByUserId: AppRouteHandler<ListByUserRoute>;
	getFiltered: AppRouteHandler<FilterTransactionsRoute>;
	create: AppRouteHandler<CreateRoute>;
	update: AppRouteHandler<UpdateRoute>;
	delete: AppRouteHandler<DeleteRoute>;
	getMonthlyBalance: AppRouteHandler<GetMonthlyBalanceRoute>;
	getCategoryTotals: AppRouteHandler<GetCategoryTotalsRoute>;
	getMonthlyTrends: AppRouteHandler<GetMonthlyTrendsRoute>;
}
