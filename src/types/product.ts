export type StockStatus = 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';

export type StockMovementType = 'IN' | 'OUT';

export type Product = {
  id: string;
  name: string;
  reference: string;
  description: string | null;
  category: string;
  quantity: number;
  alertThreshold: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  reference: string;
  description?: string;
  category: string;
  quantity: number;
  alertThreshold: number;
};

export type UpdateProductInput = CreateProductInput;

export type StockMovementInput = {
  type: StockMovementType;
  quantity: number;
};
