import { PrismaClient } from '@prisma/client';

// Declaração para evitar múltiplas instâncias do PrismaClient em desenvolvimento
declare global {
  var prisma: PrismaClient | undefined;
}

// Evita criar novas conexões a cada hot-reload em desenvolvimento
export const prisma = global.prisma || new PrismaClient();
export const db = prisma; // Alias para compatibilidade

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
