import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Status } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.tagsOnTodos.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.listSettings.deleteMany();
  await prisma.list.deleteMany();

  const list = await prisma.list.create({ data: { settings: { create: {} } } });

  const [work, personal, urgent, health] = await Promise.all([
    prisma.tag.create({ data: { listId: list.id, name: "Work", color: "#3b82f6" } }),
    prisma.tag.create({ data: { listId: list.id, name: "Personal", color: "#10b981" } }),
    prisma.tag.create({ data: { listId: list.id, name: "Urgent", color: "#ef4444" } }),
    prisma.tag.create({ data: { listId: list.id, name: "Health", color: "#f59e0b" } }),
  ]);

  const now = Date.now();
  const days = (n: number) => new Date(now + n * 86_400_000);

  const todos: Array<{
    title: string;
    description?: string;
    status: Status;
    urgent: boolean;
    important: boolean;
    dueDate?: Date;
    tagIds: string[];
  }> = [
    { title: "Finish Q3 budget review", description: "Reconcile spend vs forecast", status: "IN_PROGRESS", urgent: true, important: true, dueDate: days(1), tagIds: [work.id, urgent.id] },
    { title: "Prep client demo slides", status: "TODO", urgent: true, important: true, dueDate: days(2), tagIds: [work.id] },
    { title: "Plan family vacation", status: "TODO", urgent: false, important: true, dueDate: days(30), tagIds: [personal.id] },
    { title: "Read 'Deep Work'", status: "TODO", urgent: false, important: true, tagIds: [personal.id] },
    { title: "Annual physical checkup", status: "TODO", urgent: false, important: true, dueDate: days(10), tagIds: [health.id] },
    { title: "Respond to non-critical emails", status: "TODO", urgent: true, important: false, tagIds: [work.id] },
    { title: "Approve routine expense reports", status: "IN_PROGRESS", urgent: true, important: false, tagIds: [work.id] },
    { title: "Reorganize downloads folder", status: "TODO", urgent: false, important: false, tagIds: [] },
    { title: "Browse social media", status: "TODO", urgent: false, important: false, tagIds: [] },
    { title: "Renew gym membership", status: "DONE", urgent: false, important: true, tagIds: [health.id] },
    { title: "Submit expense report", status: "DONE", urgent: true, important: true, tagIds: [work.id] },
    { title: "Water the plants", status: "DONE", urgent: false, important: false, tagIds: [personal.id] },
  ];

  for (const t of todos) {
    await prisma.todo.create({
      data: {
        listId: list.id,
        title: t.title,
        description: t.description,
        status: t.status,
        urgent: t.urgent,
        important: t.important,
        dueDate: t.dueDate,
        tags: { create: t.tagIds.map((tagId) => ({ tagId })) },
      },
    });
  }

  console.log(`Seeded list: ${list.id}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
