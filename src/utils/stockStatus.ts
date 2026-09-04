import type { StockStatus } from '../types/product';

export function getStockStatus(
  quantity: number,
  alertThreshold: number,
): StockStatus {
  if (quantity === 0) {
    return 'OUT_OF_STOCK';
  }

  if (quantity <= alertThreshold) {
    return 'LOW';
  }

  return 'NORMAL';
}
