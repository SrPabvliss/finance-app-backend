import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByUserRoute,
	ListRoute,
	ListSharedRoute,
	UpdateRoute,
} from "@/payment-methods/infrastructure/controllers/payment-method.routes";

export interface IPaymentMethodService {
	getAll: AppRouteHandler<ListRoute>;
	getById: AppRouteHandler<GetByIdRoute>;
	getByUserId: AppRouteHandler<ListByUserRoute>;
	getSharedWithUser: AppRouteHandler<ListSharedRoute>;
	create: AppRouteHandler<CreateRoute>;
	update: AppRouteHandler<UpdateRoute>;
	delete: AppRouteHandler<DeleteRoute>;
}
