export const hash = async (password: string): Promise<string> => {
	return Bun.password.hash(password);
};

export const verify = async (
	password: string,
	hash: string
): Promise<boolean> => {
	return Bun.password.verify(password, hash);
};
