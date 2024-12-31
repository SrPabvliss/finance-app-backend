import { z } from "zod";
import { selectPaymentMethodSchema } from "@/payment-methods/application/dtos/payment-method.dto";
import { IPaymentMethod } from "@/payment-methods/domain/entities/IPaymentMethod";

export class PaymentMethodApiAdapter {
	static toApiResponse(
		paymentMethod: IPaymentMethod
	): z.infer<typeof selectPaymentMethodSchema> {
		return {
			id: paymentMethod.id,
			user_id: paymentMethod.userId,
			shared_user_id: paymentMethod.sharedUserId || null,
			name: paymentMethod.name,
			type: paymentMethod.type,
			last_four_digits: paymentMethod.lastFourDigits || null,
		};
	}

	static toApiResponseList(
		paymentMethods: IPaymentMethod[]
	): z.infer<typeof selectPaymentMethodSchema>[] {
		return paymentMethods.map(this.toApiResponse);
	}
}
