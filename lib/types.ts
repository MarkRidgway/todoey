import type { Prisma, Tag } from "@/lib/generated/prisma/client";

export type TodoWithTagRows = Prisma.TodoGetPayload<{
  include: { tags: { include: { tag: true } } };
}>;

export type TodoWithTags = Omit<TodoWithTagRows, "tags"> & { tags: Tag[] };

export function flattenTodoTags(todo: TodoWithTagRows): TodoWithTags {
  return { ...todo, tags: todo.tags.map((t) => t.tag) };
}

export type { Tag };
