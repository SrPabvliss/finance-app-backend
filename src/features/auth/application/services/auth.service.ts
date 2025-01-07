import { IUserRepository } from "@/users/domain/ports/user-repository.port";
import { createHandler } from "@/core/infrastructure/lib/handler.wrapper,";
import {
	LoginRoute,
	RegisterRoute,
} from "@/auth/infrastructure/controllers/auth.routes";
import { hash, verify } from "@/shared/utils/crypto.util";
import { generateToken } from "@/shared/utils/jwt.util";
import * as HttpStatusCodes from "stoker/http-status-codes";

export class AuthService {
	private static instance: AuthService;

	constructor(private readonly userRepository: IUserRepository) {}

	public static getInstance(userRepository: IUserRepository): AuthService {
		if (!AuthService.instance) {
			AuthService.instance = new AuthService(userRepository);
		}
		return AuthService.instance;
	}

	login = createHandler<LoginRoute>(async (c) => {
		const { email, password } = c.req.valid("json");

		const user = await this.userRepository.findByEmail(email);
		if (!user || !user.active) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Invalid credentials",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		const isValidPassword = await verify(password, user.passwordHash);
		if (!isValidPassword) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Invalid credentials",
				},
				HttpStatusCodes.BAD_REQUEST
			);
		}

		// Generar token JWT
		const token = await generateToken({
			id: user.id,
			email: user.email,
		});

		return c.json(
			{
				success: true,
				data: {
					id: user.id,
					email: user.email,
					name: user.name,
					username: user.username,
					token,
				},
				message: "Login successful",
			},
			HttpStatusCodes.OK
		);
	});

	register = createHandler<RegisterRoute>(async (c) => {
		const data = c.req.valid("json");

		// Verificar email único
		const existingEmail = await this.userRepository.findByEmail(data.email);
		if (existingEmail) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Email already exists",
				},
				HttpStatusCodes.CONFLICT
			);
		}

		// Verificar username único
		const existingUsername = await this.userRepository.findByUsername(
			data.username
		);
		if (existingUsername) {
			return c.json(
				{
					success: false,
					data: null,
					message: "Username already exists",
				},
				HttpStatusCodes.CONFLICT
			);
		}

		// Crear usuario
		const passwordHash = await hash(data.password);
		const user = await this.userRepository.create({
			name: data.name,
			username: data.username,
			email: data.email,
			passwordHash,
			active: true,
		});

		// Generar token
		const token = await generateToken({
			id: user.id,
			email: user.email,
		});

		return c.json(
			{
				success: true,
				data: {
					id: user.id,
					email: user.email,
					name: user.name,
					username: user.username,
					token,
				},
				message: "Registration successful",
			},
			HttpStatusCodes.CREATED
		);
	});
}
