import { idSchema } from "@reactive-resume/schema";
import { z } from "zod";

export const payloadSchema = z.object({
  id: idSchema,
  isTwoFactorAuth: z.boolean().optional(),
  role: z.enum(["USER", "HR", "ADMIN"]),
});

export type Payload = z.infer<typeof payloadSchema>;
