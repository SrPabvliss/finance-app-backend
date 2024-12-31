import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListByUserRoute,
	ListRoute,
	ListSharedRoute,
	UpdateProgressRoute,
	UpdateRoute,
} from "@/goals/infrastucture/controllers/goal.routes";

export interface IGoalService {
	getAll: AppRouteHandler<ListRoute>;
	getById: AppRouteHandler<GetByIdRoute>;
	getByUserId: AppRouteHandler<ListByUserRoute>;
	getSharedWithUser: AppRouteHandler<ListSharedRoute>;
	create: AppRouteHandler<CreateRoute>;
	update: AppRouteHandler<UpdateRoute>;
	delete: AppRouteHandler<DeleteRoute>;
	updateProgress: AppRouteHandler<UpdateProgressRoute>;
}
