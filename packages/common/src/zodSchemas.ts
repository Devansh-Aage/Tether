import { z } from "zod";

export const registerUser = z.object({
  username: z.string().min(3, "Username must have atleast 3 characters"),
  email: z.string().email("Please enter a valid Email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least 1 special character",
    }),
});

export const loginUser = z.object({
  email: z.string().email("Please enter a valid Email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least 1 special character",
    }),
});
