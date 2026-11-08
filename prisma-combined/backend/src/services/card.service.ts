import type { Card } from "../../../generated/prisma/client.js";
import { prismaClient } from "../db/prisma.js";

export async function createCardForList(
  listId: number,
  data: Pick<
    Card,
    "title" | "description" | "position" | "assigneeId" | "dueDate"
  >,
) {
  return prismaClient.card.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      position: data.position,
      assigneeId: data.assigneeId,
      listId,
    },
  });
}

export async function moveCard(
  cardId: number,
  newListId: number,
  newPosition: number,
) {
  const card = await prismaClient.card.findUnique({ where: { id: cardId } });
  if (!card) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const prevCard = await prismaClient.card.findFirst({
    where: {
      listId: newListId,
      position: { lt: newPosition },
    },
    orderBy: {
      position: "desc",
    },
  });

  const prevPosition = !prevCard ? 0 : prevCard.position;

  await prismaClient.card.update({
    where: { id: cardId },
    data: {
      listId: newListId,
      position: (prevPosition + newPosition) / 2.0,
    },
  });

  return { ok: true as const };
}

export async function searchCards(keyword: string) {
  return prismaClient.$queryRaw`
    SELECT "id", "title"
    FROM "Card"
    WHERE to_tsvector('english', "title") @@ plainto_tsquery('english', ${keyword})
  `;
}

export async function listCards(filters: {
  assignee?: string;
  due?: string;
}) {
  const { assignee, due } = filters;
  let dueFilter: Record<string, unknown> = {};

  if (due === "overdue") {
    dueFilter = {
      dueDate: { lt: new Date() },
      completedAt: null,
    };
  } else if (due) {
    const parsedDate = new Date(due);
    if (!isNaN(parsedDate.getTime())) {
      dueFilter = { dueDate: parsedDate };
    }
  }

  return prismaClient.card.findMany({
    where: {
      assigneeId: assignee ? Number(assignee) : {},
      ...dueFilter,
    },
  });
}
