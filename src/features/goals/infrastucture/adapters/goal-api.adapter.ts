import { z } from "zod";
import { selectGoalSchema } from "@/goals/application/dtos/goal.dto";
import { IGoal } from "@/goals/domain/entities/IGoal";

export class GoalApiAdapter {
	static toApiResponse(goal: IGoal): z.infer<typeof selectGoalSchema> {
		return {
			id: goal.id,
			user_id: goal.userId,
			shared_user_id: goal.sharedUserId || null,
			name: goal.name,
			target_amount: goal.targetAmount.toString(),
			current_amount: goal.currentAmount.toString(),
			end_date: goal.endDate.toString(),
		};
	}

	static toApiResponseList(goals: IGoal[]): z.infer<typeof selectGoalSchema>[] {
		return goals.map(this.toApiResponse);
	}
}
