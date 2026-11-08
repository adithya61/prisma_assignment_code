import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { ProductWhereInput } from "./generated/prisma/models/Product";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const where: ProductWhereInput = {};

interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  includeCategory?: string;
  inStock?: boolean;
}

const searchProducts = async (filters: ProductFilters) => {
  const { minPrice, maxPrice, includeCategory, inStock } = filters;

  if (minPrice != undefined || maxPrice != undefined) {
    where.price = { gt: minPrice, lt: maxPrice };
  }

  if (includeCategory != undefined) {
    where.category = { contains: includeCategory };
  }

  if (inStock != undefined) where.inStock = { equals: inStock };

  const result = await prisma.product.findMany({
    where,
    orderBy: {
        price: 'asc'
    }
  });

  console.log(result);
  
};

async function main() {
  // equals
  //   const res = await prisma.product.findMany({
  //     where: {
  //       inStock: {
  //         equals: false,
  //       },
  //     },
  //   });
  //   not
  //   const neg = await prisma.product.findMany({
  //     where: {
  //       inStock: {
  //         not: false,
  //       },
  //     },
  //   });
  //   greater than
  //   const gt = await prisma.product.findMany({
  //     select: {
  //       name: true,
  //       price: true,
  //     },
  //     where: {
  //       price: {
  //         gt: 70, // gt, gte, lt, lte
  //       },
  //     },
  //   });
  // contains, startswith
  // const st = await prisma.product.findMany({
  //     where: {
  //         category: {
  //             contains: "Home" // startsWith endsWith
  //         }
  //     }
  // })
  // in not in filter by multiple categories
  // const cat = await prisma.product.findMany({
  //     where:{
  //         category: {
  //             in:["Electronics", "Clothing"] // not in
  //         }
  //     }
  // })
  // and or not
  // const logi = await prisma.product.findMany({
  //     where: {
  //         AND: [
  //             {inStock: true},
  //             {price: {lt: 70}}
  //         ]
  //     }
  // })
  // offset pagination
  // const offPag = await prisma.product.findMany({
  //   skip: 29,
  //   take: 10,
  // });
  // cursor pagination
  //   const curPag = await prisma.product.findMany({
  //     take: 10,
  //     skip: 1,
  //     cursor: {
  //       id: 29,
  //     },
  //   });

    searchProducts({
        inStock: true,
        minPrice: 10,
        maxPrice: 80
    })

}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
