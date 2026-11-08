import type { Request, Response } from "express";
import type { Board } from "../../../generated/prisma/client.js";
import * as boardService from "../services/board.service.js";

export async function createBoard(req: Request, res: Response) {
  const { name, workspaceId } = req.body as Board;

  try {
    await boardService.createBoard({ name, workspaceId });
    res.status(201).send({ msg: "board created successfully" });
  } catch (error) {
    res.send({ error, msg: "Unexpected error occured" });
  }
}

export async function getBoards(_req: Request, res: Response) {
  try {
    const boards = await boardService.getAllBoards();
    res.send(boards);
  } catch (error) {
    res.send({ error, msg: "Unexpected error occured" });
  }
}

export async function getBoard(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const board = await boardService.getBoardByIdWithLists(id);
    res.send(board);
  } catch (e) {
    res.send(e);
  }
}
