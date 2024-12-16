import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import {
	CreateRoute,
	DeleteRoute,
	GetByIdRoute,
	ListRoute,
	ResetPasswordRoute,
	SetRecoveryTokenRoute,
	UpdateRoute,
} from "@/users/infrastructure/controllers/user.routes";

export interface IUserService {
	getAll: AppRouteHandler<ListRoute>;
	create: AppRouteHandler<CreateRoute>;
	update: AppRouteHandler<UpdateRoute>;
	delete: AppRouteHandler<DeleteRoute>;
	getById: AppRouteHandler<GetByIdRoute>;
	setRecoveryToken: AppRouteHandler<SetRecoveryTokenRoute>;
	resetPassword: AppRouteHandler<ResetPasswordRoute>;
}
