import { SignJWT, jwtVerify } from "jose";
import env from "@/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function generateToken(payload: any): Promise<string> {
	const jwt = await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("24h")
		.sign(secret);

	return jwt;
}

export async function verifyToken(token: string): Promise<any> {
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch (error) {
		return null;
	}
}
