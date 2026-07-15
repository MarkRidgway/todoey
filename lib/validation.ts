import { z } from "zod";

export const TodoInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  urgent: z.boolean(),
  important: z.boolean(),
  dueDate: z.coerce.date().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
});
export type TodoInput = z.infer<typeof TodoInputSchema>;

export const TagInputSchema = z.object({
  name: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
});
export type TagInput = z.infer<typeof TagInputSchema>;

export const ListKeySchema = z.string().uuid();
export function isValidListKey(key: string): boolean {
  return ListKeySchema.safeParse(key).success;
}
