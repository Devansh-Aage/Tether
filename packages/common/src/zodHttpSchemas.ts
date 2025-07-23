import { z } from "zod";

export const registerUser = z.object({
  username: z
    .string()
    .min(3, "Username must have atleast 3 characters")
    .max(32, "Username too long!"),
  email: z.string().email("Please enter a valid Email"),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters long.")
    .max(32, "Password too long!")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least 1 special character",
    }),
});

export const loginUser = z.object({
  email: z.string().email("Please enter a valid Email"),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters long.")
    .max(32, "Password too long!")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least 1 special character",
    }),
});

export const addTask = z.object({
  title: z
    .string()
    .min(2, "Task title must be atleast 2 characters long.")
    .max(52, "Task title too long!"),
});

export const addMilestone = z.object({
  title: z
    .string()
    .min(3, "The title must be at least 2 characters long")
    .max(52, "Milestone title too long!"),
  description: z
    .string()
    .min(10, "The description must be at least 10 characters long")
    .max(200, "Milestone description too long!"),
  deadline: z.string().date("Please Enter a valid Date"),
});
