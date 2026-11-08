import type { Request, Response } from "express";
import type { Card } from "../../../generated/prisma/client.js";
import * as cardService from "../services/card.service.js";

export async function createCard(req: Request, res: Response) {
  const listId = Number(req.params.id);
  const { title, description, position, assigneeId, dueDate } =
    req.body as Card;

  try {
    await cardService.createCardForList(listId, {
      title,
      description,
      position,
      assigneeId,
      dueDate,
    });
    res.send({ msg: "card added successfully" });
  } catch (error) {
    res.send({ error, msg: "Error occured" });
  }
}

export async function moveCard(req: Request, res: Response) {
  const cardId = Number(req.params.id);
  const { newListId, newPosition } = req.body;

  try {
    const result = await cardService.moveCard(cardId, newListId, newPosition);
    if (!result.ok) {
      return res.send({ msg: "Error Card does not exist!" });
    }
    res.json({ msg: "updated successfully" });
  } catch (error) {
    res.send({ error, msg: "Error occured" });
  }
}

export async function getCards(req: Request, res: Response) {
  const { assignee, due, search } = req.query;

  if (search && typeof search === "string") {
    try {
      const result = await cardService.searchCards(search);
      return res.status(200).send(result);
    } catch (error) {
      return res.send({ error, msg: "Error occured" });
    }
  }

  try {
    const filters: { assignee?: string; due?: string } = {};
    if (typeof assignee === "string") filters.assignee = assignee;
    if (typeof due === "string") filters.due = due;

    const cards = await cardService.listCards(filters);
    res.status(200).send(cards);
  } catch (error) {
    res.send({ error, msg: "Error occured" });
  }
}
