import type { List } from "../../../generated/prisma/client.js";
import { prismaClient } from "../db/prisma.js";

export async function createListForBoard(
  boardId: number,
  data: Pick<List, "name" | "position">,
) {
  return prismaClient.list.create({
    data: {
      name: data.name,
      boardId,
      position: data.position,
    },
  });
}

export async function getListByBoardId(boardId: number) {
  return prismaClient.list.findFirst({ where: { boardId } });
}

export async function getListById(id: number) {
  return prismaClient.list.findFirst({
    where: { id },
  });
}
