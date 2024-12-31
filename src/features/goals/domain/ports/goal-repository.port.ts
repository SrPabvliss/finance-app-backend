import { IGoal } from "../entities/IGoal";

export interface IGoalRepository {
	findAll(): Promise<IGoal[]>;
	findById(id: number): Promise<IGoal | null>;
	findByUserId(userId: number): Promise<IGoal[]>;
	findSharedWithUser(userId: number): Promise<IGoal[]>;
	create(goal: Omit<IGoal, "id">): Promise<IGoal>;
	update(id: number, goal: Partial<IGoal>): Promise<IGoal>;
	delete(id: number): Promise<boolean>;
	updateProgress(id: number, amount: number): Promise<IGoal>;
}
