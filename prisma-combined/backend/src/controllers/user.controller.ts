import type { Request, Response } from "express";
import type { User } from "../../../generated/prisma/client.js";
import * as userService from "../services/user.service.js";

export async function createUser(req: Request, res: Response) {
  const { email, name } = req.body as User;

  try {
    await userService.createUser({ email, name });
    res.status(201).send({ msg: "user created successfully" });
  } catch (error) {
    res.send({ error, msg: "Unexpected error occured" });
  }
}

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await userService.getAllUsers();
    res.send(users);
  } catch (error) {
    res.send({ error, msg: "unexpected error" });
  }
}
