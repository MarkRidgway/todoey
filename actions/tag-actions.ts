"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TagInputSchema, type TagInput } from "@/lib/validation";

async function requireOwnedTag(listId: string, id: string) {
  const tag = await prisma.tag.findFirst({ where: { id, listId }, select: { id: true } });
  if (!tag) throw new Error("Tag not found in this list");
}

export async function createTag(listId: string, input: TagInput) {
  const data = TagInputSchema.parse(input);
  const tag = await prisma.tag.create({ data: { ...data, listId } });
  revalidatePath(`/${listId}`);
  return tag;
}

export async function updateTag(listId: string, id: string, input: TagInput) {
  const data = TagInputSchema.parse(input);
  await requireOwnedTag(listId, id);
  const tag = await prisma.tag.update({ where: { id }, data });
  revalidatePath(`/${listId}`);
  return tag;
}

export async function deleteTag(listId: string, id: string) {
  await requireOwnedTag(listId, id);
  await prisma.tag.delete({ where: { id } });
  revalidatePath(`/${listId}`);
}
