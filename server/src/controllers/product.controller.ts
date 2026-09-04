import type { RequestHandler } from 'express';

import { HttpError } from '../middleware/errorHandler';
import {
  createProduct as createProductInDatabase,
  getProduct as getProductFromDatabase,
  getProducts as getProductsFromDatabase,
  updateProduct as updateProductInDatabase,
  updateStock as updateStockInDatabase,
  type ProductInput,
  type StockMovementInput,
} from '../services/product.service';

type JsonObject = Record<string, unknown>;
type ProductIdParams = { id: string };

function readJsonObject(value: unknown): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpError(400, 'Le corps de la requête doit être un objet JSON.');
  }

  return value as JsonObject;
}

function readRequiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `Le champ "${field}" est obligatoire.`);
  }

  return value.trim();
}

function readDescription(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, 'Le champ "description" doit être un texte.');
  }

  return value.trim() || null;
}

function readNonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new HttpError(
      400,
      `Le champ "${field}" doit être un entier positif ou nul.`,
    );
  }

  return value;
}

function readPositiveInteger(value: unknown, field: string): number {
  const number = readNonNegativeInteger(value, field);

  if (number === 0) {
    throw new HttpError(400, `Le champ "${field}" doit être supérieur à zéro.`);
  }

  return number;
}

function parseProductInput(body: unknown): ProductInput {
  const input = readJsonObject(body);

  return {
    name: readRequiredText(input.name, 'name'),
    reference: readRequiredText(input.reference, 'reference'),
    description: readDescription(input.description),
    category: readRequiredText(input.category, 'category'),
    quantity: readNonNegativeInteger(input.quantity, 'quantity'),
    alertThreshold: readNonNegativeInteger(
      input.alertThreshold,
      'alertThreshold',
    ),
  };
}

function parseStockMovement(body: unknown): StockMovementInput {
  const input = readJsonObject(body);

  if (input.type !== 'IN' && input.type !== 'OUT') {
    throw new HttpError(400, 'Le champ "type" doit valoir "IN" ou "OUT".');
  }

  return {
    type: input.type,
    quantity: readPositiveInteger(input.quantity, 'quantity'),
  };
}

export const getProducts: RequestHandler = async (_request, response) => {
  const products = await getProductsFromDatabase();
  response.status(200).json(products);
};

export const getProduct: RequestHandler<ProductIdParams> = async (
  request,
  response,
) => {
  const product = await getProductFromDatabase(request.params.id);
  response.status(200).json(product);
};

export const createProduct: RequestHandler = async (request, response) => {
  const input = parseProductInput(request.body);
  const product = await createProductInDatabase(input);
  response.status(201).json(product);
};

export const updateProduct: RequestHandler<ProductIdParams> = async (
  request,
  response,
) => {
  const input = parseProductInput(request.body);
  const product = await updateProductInDatabase(request.params.id, input);
  response.status(200).json(product);
};

export const updateStock: RequestHandler<ProductIdParams> = async (
  request,
  response,
) => {
  const movement = parseStockMovement(request.body);
  const product = await updateStockInDatabase(request.params.id, movement);
  response.status(200).json(product);
};
