import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient;

export function getTenantPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}
