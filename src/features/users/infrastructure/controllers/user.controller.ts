import { createRouter } from "@/core/infrastructure/lib/create-app";
import * as routes from "./user.routes";
import { UserService } from "@/users/application/services/user.service";
import { PgUserRepository } from "../adapters/user.repository";
import { UserUtilsService } from "@/users/application/services/user-utils.service";

const repository = PgUserRepository.getInstance();
const userUtils = UserUtilsService.getInstance(repository);
const userService = UserService.getInstance(repository, userUtils);

const router = createRouter()
	.openapi(routes.list, userService.getAll)
	.openapi(routes.create, userService.create)
	.openapi(routes.update, userService.update)
	.openapi(routes.delete_, userService.delete)
	.openapi(routes.getById, userService.getById)
	.openapi(routes.setRecoveryToken, userService.setRecoveryToken)
	.openapi(routes.resetPassword, userService.resetPassword);

export default router;
