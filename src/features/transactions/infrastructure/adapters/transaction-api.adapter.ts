import { z } from "zod";
import { selectTransactionSchema } from "@/transactions/application/dtos/transaction.dto";
import { ITransaction } from "@/transactions/domain/entities/ITransaction";

export class TransactionApiAdapter {
	static toApiResponse(
		transaction: ITransaction
	): z.infer<typeof selectTransactionSchema> {
		return {
			id: transaction.id,
			user_id: transaction.userId,
			amount: transaction.amount.toString(),
			type: transaction.type,
			category: transaction.category,
			description: transaction.description || null,
			payment_method_id: transaction.paymentMethodId || null,
			date: transaction.date,
			scheduled_transaction_id: transaction.scheduledTransactionId || null,
			debt_id: transaction.debtId || null,
		};
	}

	static toApiResponseList(
		transactions: ITransaction[]
	): z.infer<typeof selectTransactionSchema>[] {
		return transactions.map(this.toApiResponse);
	}
}
