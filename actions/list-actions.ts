"use server";

import { prisma } from "@/lib/prisma";
import { isValidListKey } from "@/lib/validation";

export async function createList(): Promise<{ listKey: string }> {
  const list = await prisma.list.create({ data: { settings: { create: {} } } });
  return { listKey: list.id };
}

export async function listExists(listKey: string): Promise<boolean> {
  if (!isValidListKey(listKey)) return false;
  const list = await prisma.list.findUnique({ where: { id: listKey }, select: { id: true } });
  return list !== null;
}
