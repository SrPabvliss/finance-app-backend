import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByCreditorRoute,
	ListByUserRoute,
	ListRoute,
	PayDebtRoute,
	UpdateRoute,
} from "@/debts/infrastructure/controllers/debt.routes";

export interface IDebtService {
	getAll: AppRouteHandler<ListRoute>;
	getById: AppRouteHandler<GetByIdRoute>;
	getByUserId: AppRouteHandler<ListByUserRoute>;
	getByCreditorId: AppRouteHandler<ListByCreditorRoute>;
	create: AppRouteHandler<CreateRoute>;
	update: AppRouteHandler<UpdateRoute>;
	delete: AppRouteHandler<DeleteRoute>;
	payDebt: AppRouteHandler<PayDebtRoute>;
}
