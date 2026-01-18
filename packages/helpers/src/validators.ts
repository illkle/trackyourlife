import { z } from "zod";

export const EmailValidator = z.email("Must be a valid email");

export const PasswordValidator = z.string().min(16, "Must be at least 16 characters");

export const NameValidator = z.string().min(3, "Must be at least 3 characters");
