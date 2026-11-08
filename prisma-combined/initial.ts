import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // Users
  const alice = await prisma.user.create({
    data: { name: "Alice Sharma", email: "alice@example.com" },
  });
  const bob = await prisma.user.create({
    data: { name: "Bob Menon", email: "bob@example.com" },
  });
  const carol = await prisma.user.create({
    data: { name: "Carol Fernandes", email: "carol@example.com" },
  });

  // Workspace (owned by Alice, Bob + Carol as members)
  const workspace = await prisma.workspace.create({
    data: {
      name: "Product Team",
      ownerId: alice.id,
      members: {
        connect: [{ id: alice.id }, { id: bob.id }, { id: carol.id }],
      },
    },
  });

  // Labels
  const bugLabel = await prisma.label.create({
    data: { name: "Bug", color: "#e53935", workspaceId: workspace.id },
  });
  const urgentLabel = await prisma.label.create({
    data: { name: "Urgent", color: "#fb8c00", workspaceId: workspace.id },
  });

  // Board
  const board = await prisma.board.create({
    data: { name: "Sprint 12", workspaceId: workspace.id },
  });

  // Lists
  const todoList = await prisma.list.create({
    data: { name: "To Do", boardId: board.id, position: 0, cardOrder: [] },
  });
  const inProgressList = await prisma.list.create({
    data: {
      name: "In Progress",
      boardId: board.id,
      position: 1,
      cardOrder: [],
    },
  });
  const doneList = await prisma.list.create({
    data: { name: "Done", boardId: board.id, position: 2, cardOrder: [] },
  });

  // Cards
  const card1 = await prisma.card.create({
    data: {
      title: "Fix login redirect bug",
      description: "Redirects to wrong page after OAuth login",
      listId: todoList.id,
      assigneeId: bob.id,
      dueDate: new Date("2026-10-10"),
      position: 0,
    },
  });
  const card2 = await prisma.card.create({
    data: {
      title: "Design card detail modal",
      listId: todoList.id,
      assigneeId: carol.id,
      position: 1,
    },
  });
  const card3 = await prisma.card.create({
    data: {
      title: "Implement drag-and-drop reorder",
      listId: inProgressList.id,
      assigneeId: bob.id,
      dueDate: new Date("2026-09-25"), // in the past — good for testing "overdue"
      position: 0,
    },
  });
  const card4 = await prisma.card.create({
    data: {
      title: "Set up CI pipeline",
      listId: doneList.id,
      assigneeId: alice.id,
      position: 0,
      completedAt: new Date(),
    },
  });

  // CardLabels
  await prisma.cardLabel.createMany({
    data: [
      { cardId: card1.id, labelId: bugLabel.id },
      { cardId: card1.id, labelId: urgentLabel.id },
      { cardId: card3.id, labelId: bugLabel.id },
    ],
  });

  console.log("Seed complete:", { workspace: workspace.id, board: board.id });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
