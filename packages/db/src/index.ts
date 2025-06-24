import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

const test = async () => {
  const user = await prisma.user.findMany();
};
