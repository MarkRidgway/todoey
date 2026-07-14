import { TodoApp } from "@/components/todo-app";
import { prisma } from "@/lib/prisma";
import { flattenTodoTags } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [todos, tags] = await Promise.all([
    prisma.todo.findMany({
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <TodoApp initialTodos={todos.map(flattenTodoTags)} initialTags={tags} />;
}
