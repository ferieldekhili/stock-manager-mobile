import type { Product } from '@prisma/client';

import { HttpError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

export type ProductInput = {
  name: string;
  reference: string;
  description: string | null;
  category: string;
  quantity: number;
  alertThreshold: number;
};

export type StockMovementInput = {
  type: 'IN' | 'OUT';
  quantity: number;
};

export function getProducts(): Promise<Product[]> {
  return prisma.product.findMany({ orderBy: { updatedAt: 'desc' } });
}

export async function getProduct(id: string): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new HttpError(404, 'Produit introuvable.');
  }

  return product;
}

export function createProduct(input: ProductInput): Promise<Product> {
  return prisma.product.create({ data: input });
}

export function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  return prisma.product.update({ where: { id }, data: input });
}

export async function updateStock(
  id: string,
  movement: StockMovementInput,
): Promise<Product> {
  if (movement.type === 'IN') {
    return prisma.product.update({
      where: { id },
      data: { quantity: { increment: movement.quantity } },
    });
  }

  const updateResult = await prisma.product.updateMany({
    where: {
      id,
      quantity: { gte: movement.quantity },
    },
    data: { quantity: { decrement: movement.quantity } },
  });

  if (updateResult.count === 0) {
    const productExists = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!productExists) {
      throw new HttpError(404, 'Produit introuvable.');
    }

    throw new HttpError(400, 'Le stock disponible est insuffisant.');
  }

  return getProduct(id);
}
