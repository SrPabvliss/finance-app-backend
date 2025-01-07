import { createRouter } from "@/core/infrastructure/lib/create-app";
import * as routes from "./auth.routes";
import { PgUserRepository } from "@/users/infrastructure/adapters/user.repository";
import { AuthService } from "@/auth/application/services/auth.service";

const userRepository = PgUserRepository.getInstance();
const authService = AuthService.getInstance(userRepository);

const router = createRouter()
	.openapi(routes.login, authService.login)
	.openapi(routes.register, authService.register);

export default router;
