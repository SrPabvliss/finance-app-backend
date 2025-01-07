import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import {
	ListRoute,
	GetByIdRoute,
	ListByUserRoute,
	CreateRoute,
	DeleteRoute,
} from "@/friends/infrastructure/controllers/friend.routes";

export interface IFriendService {
	getAll: AppRouteHandler<ListRoute>;
	getById: AppRouteHandler<GetByIdRoute>;
	getByUserId: AppRouteHandler<ListByUserRoute>;
	create: AppRouteHandler<CreateRoute>;
	delete: AppRouteHandler<DeleteRoute>;
}
