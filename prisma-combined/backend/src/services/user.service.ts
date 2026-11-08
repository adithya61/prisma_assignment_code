import type { User } from "../../../generated/prisma/client.js";
import { prismaClient } from "../db/prisma.js";

export async function createUser(data: Pick<User, "email" | "name">) {
  return prismaClient.user.create({
    data: {
      email: data.email,
      name: data.name,
    },
  });
}

export async function getAllUsers() {
  return prismaClient.user.findMany({});
}
