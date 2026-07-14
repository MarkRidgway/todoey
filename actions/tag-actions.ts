"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TagInputSchema, type TagInput } from "@/lib/validation";

export async function createTag(input: TagInput) {
  const data = TagInputSchema.parse(input);
  const tag = await prisma.tag.create({ data });
  revalidatePath("/");
  return tag;
}

export async function updateTag(id: string, input: TagInput) {
  const data = TagInputSchema.parse(input);
  const tag = await prisma.tag.update({ where: { id }, data });
  revalidatePath("/");
  return tag;
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/");
}
