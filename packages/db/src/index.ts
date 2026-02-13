export { prisma as db } from "./client";

import { Prisma } from "@prisma/client";
export type Transaction = Prisma.TransactionClient;
