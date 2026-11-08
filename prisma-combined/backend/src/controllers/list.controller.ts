import type { Request, Response } from "express";
import type { List } from "../../../generated/prisma/client.js";
import * as listService from "../services/list.service.js";

export async function createList(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { name, position } = req.body as List;

  try {
    await listService.createListForBoard(id, { name, position });
    res.json({ msg: `board with ${id} created successfully` });
  } catch (error) {
    res.send({ error, msg: "Unexpected error occured" });
  }
}

export async function getListByBoard(req: Request, res: Response) {
  const boardId = Number(req.params.boardId);

  try {
    const list = await listService.getListByBoardId(boardId);
    res.send(list);
  } catch (e) {
    res.send(e);
  }
}

export async function getList(req: Request, res: Response) {
  const listId = Number(req.params.id);

  try {
    const list = await listService.getListById(listId);
    res.send(list);
  } catch (e) {
    res.send({ e, msg: "Error occured" });
  }
}
