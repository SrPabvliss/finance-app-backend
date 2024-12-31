import { createRouter } from "@/core/infrastructure/lib/create-app";
import * as routes from "./payment-method.routes";
import { PgPaymentMethodRepository } from "../adapters/payment-method.repository";
import { PgUserRepository } from "@/users/infrastructure/adapters/user.repository";
import { PaymentMethodUtilsService } from "@/payment-methods/application/services/payment-method-utils.service";
import { PaymentMethodService } from "@/payment-methods/application/services/payment-method.service";

const userRepository = PgUserRepository.getInstance();
const paymentMethodRepository = PgPaymentMethodRepository.getInstance();
const paymentMethodUtils = PaymentMethodUtilsService.getInstance(
	paymentMethodRepository,
	userRepository
);
const paymentMethodService = PaymentMethodService.getInstance(
	paymentMethodRepository,
	paymentMethodUtils
);

const router = createRouter()
	.openapi(routes.list, paymentMethodService.getAll)
	.openapi(routes.create, paymentMethodService.create)
	.openapi(routes.update, paymentMethodService.update)
	.openapi(routes.delete_, paymentMethodService.delete)
	.openapi(routes.getById, paymentMethodService.getById)
	.openapi(routes.listByUser, paymentMethodService.getByUserId)
	.openapi(routes.listShared, paymentMethodService.getSharedWithUser);

export default router;
