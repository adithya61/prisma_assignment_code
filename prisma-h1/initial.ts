import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // pr - h1 Transactions.

  const transferFunds = async (
    fromId: number,
    toId: number,
    amount: number,
  ) => {
    if (fromId == toId) throw new Error("self transfer not allowed");
    if (amount <= 0)
      throw new Error("trasaction must be greater than zero(0).");

    // Interactive Transaction
    return await prisma.$transaction(async (tx) => {
      const fromUser = await tx.wallet.findFirstOrThrow({
        where: { id: fromId },
      });
      const toUser = await tx.wallet.findFirstOrThrow({
        where: { id: toId },
      });

      if (fromUser?.balance < amount) throw new Error("insufficeint funds");

      if (!toUser) throw new Error("recepient doesn't exist");
      if (!fromUser) throw new Error("sender doesn't exit");
      if (toUser.currency != fromUser.currency)
        throw new Error(`currency doesn't match`);

      const senderBalance = await tx.wallet.update({
        where: { id: fromId },
        data: { balance: { decrement: amount } },
      });
      const receiverBalance = await tx.wallet.update({
        where: { id: toId },
        data: { balance: { increment: amount } },
      });

      // Transaction log

      const log = await tx.transactionLog.create({
        data: {
          fromId,
          toId,
          amount,
        },
      });

      return {
        status: "success",
        log,
        senderBalance: senderBalance.balance,
        receiverBalance: receiverBalance.balance,
        currency: senderBalance.currency,
      };
    }, {maxWait: 5000, timeout: 10000});
  };

  const res = await transferFunds(1, 2, 50);
  console.log(res);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
