import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
  role: z.enum(["ADMIN", "IMPORTER", "EXPORTER"]),
  company: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = userCreateSchema
  .omit({ password: true })
  .extend({
    password: z.union([z.string().min(8), z.literal("")]).optional(),
  });

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
