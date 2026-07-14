import { notFound } from "next/navigation";
import { TodoApp } from "@/components/todo-app";
import { prisma } from "@/lib/prisma";
import { flattenTodoTags, VIEW_ENUM_TO_ID } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ListPage({ params }: { params: Promise<{ listKey: string }> }) {
  const { listKey } = await params;

  const list = await prisma.list.findUnique({
    where: { id: listKey },
    include: { settings: true },
  });

  if (!list) notFound();

  const [todos, tags] = await Promise.all([
    prisma.todo.findMany({
      where: { listId: listKey },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tag.findMany({ where: { listId: listKey }, orderBy: { name: "asc" } }),
  ]);

  const enabledViews = (list.settings?.enabledViews ?? ["LIST", "KANBAN", "GRID", "MATRIX"]).map(
    (v) => VIEW_ENUM_TO_ID[v]
  );

  return (
    <TodoApp
      listKey={listKey}
      initialTodos={todos.map(flattenTodoTags)}
      initialTags={tags}
      enabledViews={enabledViews}
    />
  );
}
