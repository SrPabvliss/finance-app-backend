import { createRouter } from "@/core/infrastructure/lib/create-app";
import * as routes from "./friend.routes";
import { PgUserRepository } from "@/users/infrastructure/adapters/user.repository";
import { FriendUtilsService } from "@/friends/application/services/friend-utils.service";
import { FriendService } from "@/friends/application/services/friend.service";
import { PgFriendRepository } from "../adapters/friend.repository";

const userRepository = PgUserRepository.getInstance();
const friendRepository = PgFriendRepository.getInstance();
const friendUtils = FriendUtilsService.getInstance(
	friendRepository,
	userRepository
);
const friendService = FriendService.getInstance(
	friendRepository,
	friendUtils,
	userRepository
);

const router = createRouter()
	.openapi(routes.list, friendService.getAll)
	.openapi(routes.getById, friendService.getById)
	.openapi(routes.listByUser, friendService.getByUserId)
	.openapi(routes.create, friendService.create)
	.openapi(routes.delete_, friendService.delete);

export default router;
