import type { Workspace } from "../../../generated/prisma/client.js";
import { prismaClient } from "../db/prisma.js";

export async function createWorkspace(
  data: Pick<Workspace, "name" | "ownerId">,
) {
  return prismaClient.workspace.create({
    data: {
      name: data.name,
      ownerId: data.ownerId,
    },
  });
}

export async function getAllWorkspaces() {
  return prismaClient.workspace.findMany({});
}

export async function getWorkspaceById(id: number) {
  return prismaClient.workspace.findFirst({
    where: { id },
  });
}

export async function getWorkspaceStats(workspaceId: number) {
  return prismaClient.$queryRaw`
    SELECT
      COUNT(*) AS total_cards,
      COUNT(*) FILTER (WHERE card."completedAt" IS NOT NULL) AS completed_cards,
      COUNT(*) FILTER (WHERE card."dueDate" < NOW() AND card."completedAt" IS NULL) AS overdue_cards,
      ROUND(
        (COUNT(*) FILTER (WHERE card."completedAt" IS NOT NULL))::numeric
        / NULLIF(COUNT(*), 0) * 100,
        2
      ) AS completion_rate
    FROM "Card" card
    JOIN "List" list ON list.id = card."listId"
    JOIN "Board" board ON board.id = list."boardId"
    WHERE board."workspaceId" = ${workspaceId}
  `;
}
