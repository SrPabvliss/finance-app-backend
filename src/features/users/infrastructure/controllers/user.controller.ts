import { AppRouteHandler } from "@/core/infrastructure/types/app-types";
import { UserService } from "@/users/application/services/user.service";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { routes } from "./user.routes";

export class UserController {
	constructor(private userService: UserService) {}

	list: AppRouteHandler<typeof routes.list> = async (c) => {
		try {
			const users = await this.userService.getAll();
			const transformedUsers = users.map((user) => ({
				id: user.id,
				username: user.username,
				email: user.email,
				name: user.name,
				active: user.active,
				registration_date: user.registrationDate,
			}));
			return c.json(transformedUsers, HttpStatusCodes.OK);
		} catch (error) {
			return c.json(
				{
					message: "Error retrieving users",
				},
				HttpStatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	};

	create: AppRouteHandler<typeof routes.create> = async (c) => {
		const userData = c.req.valid("json");
		try {
			const user = await this.userService.create(userData);
			return c.json(user, HttpStatusCodes.CREATED);
		} catch (error) {
			if (error.code === "P2002") {
				// Unique constraint error
				return c.json(
					{
						message: "Username or email already exists",
					},
					HttpStatusCodes.UNPROCESSABLE_ENTITY
				);
			}
			return c.json(
				{
					message: error.message,
				},
				HttpStatusCodes.UNPROCESSABLE_ENTITY
			);
		}
	};

	getOne: AppRouteHandler<typeof routes.getOne> = async (c) => {
		const { id } = c.req.valid("param");
		try {
			const user = await this.userService.getById(id);
			if (!user) {
				return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND);
			}
			return c.json(user, HttpStatusCodes.OK);
		} catch (error) {
			return c.json(
				{
					message: error.message,
				},
				HttpStatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	};

	update: AppRouteHandler<typeof routes.update> = async (c) => {
		const { id } = c.req.valid("param");
		const updates = c.req.valid("json");

		try {
			const user = await this.userService.update(id, updates);
			if (!user) {
				return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND);
			}
			return c.json(user, HttpStatusCodes.OK);
		} catch (error) {
			if (error.code === "P2002") {
				return c.json(
					{
						message: "Username or email already exists",
					},
					HttpStatusCodes.UNPROCESSABLE_ENTITY
				);
			}
			return c.json(
				{
					message: error.message,
				},
				HttpStatusCodes.UNPROCESSABLE_ENTITY
			);
		}
	};

	delete: AppRouteHandler<typeof routes.delete> = async (c) => {
		const { id } = c.req.valid("param");
		try {
			const deleted = await this.userService.delete(id);
			if (!deleted) {
				return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND);
			}
			return c.body(null, HttpStatusCodes.NO_CONTENT);
		} catch (error) {
			return c.json(
				{
					message: error.message,
				},
				HttpStatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	};

	resetPassword: AppRouteHandler<typeof routes.resetPassword> = async (c) => {
		const { token, password } = c.req.valid("json");
		try {
			const success = await this.userService.resetPassword(token, password);
			if (!success) {
				return c.json(
					{
						message: "Invalid or expired token",
					},
					HttpStatusCodes.UNPROCESSABLE_ENTITY
				);
			}
			return c.json(
				{
					message: "Password reset successful",
				},
				HttpStatusCodes.OK
			);
		} catch (error) {
			return c.json(
				{
					message: error.message,
				},
				HttpStatusCodes.UNPROCESSABLE_ENTITY
			);
		}
	};
}
