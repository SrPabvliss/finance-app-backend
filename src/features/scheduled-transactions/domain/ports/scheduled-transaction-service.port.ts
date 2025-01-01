import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByUserRoute,
	ListRoute,
	PendingExecutionsRoute,
	UpdateRoute,
} from "@/scheduled-transactions/infrastructure/controllers/scheduled-transaction.routes";

export interface IScheduledTransactionService {
	getAll: AppRouteHandler<ListRoute>;
	getById: AppRouteHandler<GetByIdRoute>;
	getByUserId: AppRouteHandler<ListByUserRoute>;
	create: AppRouteHandler<CreateRoute>;
	update: AppRouteHandler<UpdateRoute>;
	delete: AppRouteHandler<DeleteRoute>;
	findPendingExecutions: AppRouteHandler<PendingExecutionsRoute>;
}
