"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { flattenTodoTags } from "@/lib/types";
import { TodoInputSchema, type TodoInput } from "@/lib/validation";
import type { Status } from "@/lib/generated/prisma/client";

const TODO_WITH_TAGS_INCLUDE = { tags: { include: { tag: true } } } as const;

async function syncTodoTags(todoId: string, tagIds: string[]) {
  const existing = await prisma.tagsOnTodos.findMany({ where: { todoId } });
  const existingIds = new Set(existing.map((r) => r.tagId));
  const nextIds = new Set(tagIds);

  const toRemove = existing.filter((r) => !nextIds.has(r.tagId));
  const toAdd = tagIds.filter((id) => !existingIds.has(id));

  await prisma.$transaction([
    ...toRemove.map((r) =>
      prisma.tagsOnTodos.delete({ where: { todoId_tagId: { todoId, tagId: r.tagId } } })
    ),
    ...toAdd.map((tagId) => prisma.tagsOnTodos.create({ data: { todoId, tagId } })),
  ]);
}

export async function createTodo(input: TodoInput) {
  const data = TodoInputSchema.parse(input);

  const todo = await prisma.todo.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      urgent: data.urgent,
      important: data.important,
      dueDate: data.dueDate ?? undefined,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
    include: TODO_WITH_TAGS_INCLUDE,
  });

  revalidatePath("/");
  return flattenTodoTags(todo);
}

export async function updateTodo(id: string, input: TodoInput) {
  const data = TodoInputSchema.parse(input);

  await syncTodoTags(id, data.tagIds);

  const todo = await prisma.todo.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      urgent: data.urgent,
      important: data.important,
      dueDate: data.dueDate ?? null,
    },
    include: TODO_WITH_TAGS_INCLUDE,
  });

  revalidatePath("/");
  return flattenTodoTags(todo);
}

export async function deleteTodo(id: string) {
  await prisma.todo.delete({ where: { id } });
  revalidatePath("/");
}

export async function setTodoStatus(id: string, status: Status) {
  const todo = await prisma.todo.update({
    where: { id },
    data: { status },
    include: TODO_WITH_TAGS_INCLUDE,
  });
  revalidatePath("/");
  return flattenTodoTags(todo);
}

export async function setTodoQuadrant(id: string, urgent: boolean, important: boolean) {
  const todo = await prisma.todo.update({
    where: { id },
    data: { urgent, important },
    include: TODO_WITH_TAGS_INCLUDE,
  });
  revalidatePath("/");
  return flattenTodoTags(todo);
}
