import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    // pr - h1 Transactions.
    // -------------------------------------------------------------
  // Data for 10 Users and their 1-to-1 Wallets
  // -------------------------------------------------------------
  const usersData = [
    { name: 'Alice', balance: 100.0, currency: 'USD' },
    { name: 'Bob', balance: 250.5, currency: 'EUR' },
    { name: 'Charlie', balance: 50.0, currency: 'USD' },
    { name: 'Diana', balance: 1200.0, currency: 'GBP' },
    { name: 'Evan', balance: 340.75, currency: 'USD' },
    { name: 'Fiona', balance: 80.0, currency: 'CAD' },
    { name: 'George', balance: 500.0, currency: 'AUD' },
    { name: 'Hannah', balance: 65.25, currency: 'EUR' },
    { name: 'Ian', balance: 910.0, currency: 'USD' },
    { name: 'Julia', balance: 430.0, currency: 'JPY' },
  ]

  // -------------------------------------------------------------
  // Insert 10 Users with Wallets inside a single Transaction
  // -------------------------------------------------------------
  const createdUsers = await prisma.$transaction(
    usersData.map((item) =>
      prisma.user.create({
        data: {
          name: item.name,
          wallet: {
            create: {
              balance: item.balance,
              currency: item.currency,
            },
          },
        },
        include: {
          wallet: true,
        },
      })
    )
  )

  console.log(`Successfully created ${createdUsers.length} users with wallets:`)
  console.dir(createdUsers, { depth: null })


}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
