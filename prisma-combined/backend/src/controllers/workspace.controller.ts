import type { Request, Response } from "express";
import type { Workspace } from "../../../generated/prisma/client.js";
import * as workspaceService from "../services/workspace.service.js";

export async function createWorkspace(req: Request, res: Response) {
  const { name, ownerId } = req.body as Workspace;

  try {
    await workspaceService.createWorkspace({ name, ownerId });
    res.status(201).send({ msg: "workspace created successfully" });
  } catch (error) {
    res.send({ error, msg: "Unexpected error occured" });
  }
}

export async function getWorkspaces(_req: Request, res: Response) {
  try {
    const workspaces = await workspaceService.getAllWorkspaces();
    res.send(workspaces);
  } catch (error) {
    res.send({ error, msg: "Unexpected error occured" });
  }
}

export async function getWorkspace(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const workspace = await workspaceService.getWorkspaceById(id);
    res.send(workspace);
  } catch (error) {
    res.send({ error, msg: "Unexpected error occured" });
  }
}

export async function getWorkspaceStats(req: Request, res: Response) {
  const workspaceId = req.params.id;

  if (
    !workspaceId ||
    workspaceId === undefined ||
    workspaceId === "" ||
    isNaN(Number(workspaceId))
  ) {
    return res
      .status(400)
      .json({ msg: "route parameter not found or improper format" });
  }

  try {
    const stats = await workspaceService.getWorkspaceStats(Number(workspaceId));
    res.status(200).send(stats);
  } catch (error) {
    res.status(404).send(error);
  }
}
