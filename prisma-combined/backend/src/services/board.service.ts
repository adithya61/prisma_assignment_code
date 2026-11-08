import type { Board } from "../../../generated/prisma/client.js";
import { prismaClient } from "../db/prisma.js";

export async function createBoard(data: Pick<Board, "name" | "workspaceId">) {
  return prismaClient.board.create({
    data: {
      name: data.name,
      workspaceId: data.workspaceId,
    },
  });
}

export async function getAllBoards() {
  return prismaClient.board.findMany({});
}

export async function getBoardByIdWithLists(id: number) {
  return prismaClient.board.findFirst({
    where: { id },
    include: {
      lists: {
        orderBy: { position: "asc" },
      },
    },
  });
}
