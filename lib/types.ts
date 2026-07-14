import type { Prisma, Tag, List, ListSettings, View } from "@/lib/generated/prisma/client";
import type { ViewId } from "@/components/view-switcher";

export type TodoWithTagRows = Prisma.TodoGetPayload<{
  include: { tags: { include: { tag: true } } };
}>;

export type TodoWithTags = Omit<TodoWithTagRows, "tags"> & { tags: Tag[] };

export function flattenTodoTags(todo: TodoWithTagRows): TodoWithTags {
  return { ...todo, tags: todo.tags.map((t) => t.tag) };
}

export type ListWithSettings = Prisma.ListGetPayload<{ include: { settings: true } }>;

export const VIEW_ENUM_TO_ID: Record<View, ViewId> = {
  LIST: "list",
  KANBAN: "kanban",
  GRID: "grid",
  MATRIX: "matrix",
};

export type { Tag, List, ListSettings, View };
