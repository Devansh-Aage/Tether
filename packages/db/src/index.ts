import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const test = async () => {
  const user = await prisma.user.findMany();
};
