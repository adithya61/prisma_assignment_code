import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const lists = await prisma.list.findMany({
    include: { cards: true },
  });

  if (lists.length === 0) {
    console.log("No lists found — run your original seed first.");
    return;
  }

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found — run your original seed first.");
    return;
  }

  const titles = [
    "Fix pagination on cards list",
    "Add dark mode toggle",
    "Refactor auth middleware",
    "Write integration tests for boards API",
    "Optimize workspace stats query",
    "Add rate limiting to API",
    "Fix flaky drag-and-drop test",
    "Update Prisma schema docs",
    "Add loading skeletons to frontend",
    "Set up error tracking",
    "Improve card move transaction",
    "Add keyboard shortcuts",
    "Fix timezone bug in due dates",
    "Add card search",
    "Cache workspace member list",
  ];

  for (const list of lists) {
    const existingCount = list.cards.length;
    const toCreate = Math.max(0, 10 - existingCount);

    for (let i = 0; i < toCreate; i++) {
      const position = existingCount + i;
      const title = titles[Math.floor(Math.random() * titles.length)];
      const assignee = users[Math.floor(Math.random() * users.length)];
      if (!assignee) continue;

      // vary due dates: some past (overdue), some future, some none
      const dueRoll = Math.random();
      const dueDate =
        dueRoll < 0.3
          ? new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000) // past
          : dueRoll < 0.6
            ? new Date(Date.now() + Math.floor(Math.random() * 20) * 86400000) // future
            : null;

      const isCompleted = Math.random() < 0.25;

      await prisma.card.create({
        data: {
          title: `${title} #${position}`,
          listId: list.id,
          position,
          assigneeId: Math.random() < 0.8 ? assignee.id : null,
          dueDate,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    }

    console.log(
      `List "${list.name}": +${toCreate} cards (now ${existingCount + toCreate})`,
    );
  }

  console.log("Bulk seed complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
