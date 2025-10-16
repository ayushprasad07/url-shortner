import zod from "zod";

export const usernameValidation = zod
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");


export const signUpSchema = zod.object({
    username: usernameValidation,
    email: zod.email(),
    password: zod.string().min(6),
});