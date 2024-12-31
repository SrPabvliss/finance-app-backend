import { z } from "zod";
import { selectBudgetSchema } from "@/budgets/application/dtos/budget.dto";
import { IBudget } from "@/budgets/domain/entities/IBudget";

export class BudgetApiAdapter {
	static toApiResponse(budget: IBudget): z.infer<typeof selectBudgetSchema> {
		return {
			id: budget.id,
			user_id: budget.userId,
			shared_user_id: budget.sharedUserId || null,
			category: budget.category,
			limit_amount: budget.limitAmount.toString(),
			current_amount: budget.currentAmount.toString(),
			month: budget.month.toISOString(),
		};
	}

	static toApiResponseList(
		budgets: IBudget[]
	): z.infer<typeof selectBudgetSchema>[] {
		return budgets.map(this.toApiResponse);
	}
}
