/**
 * Generates a cryptographically secure random token
 * @param length The length of the token to generate (default: 32)
 * @returns A random token string in hexadecimal format
 */
export const generateToken = (length: number = 32): string => {
	return Array.from(crypto.getRandomValues(new Uint8Array(length)))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
};
