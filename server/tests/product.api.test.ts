import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';

import app from '../src/app';
import { prisma } from '../src/lib/prisma';

type ProductResponse = {
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

let server: Server | undefined;
let baseUrl = '';
const createdProductIds: string[] = [];

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function sendJson(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH',
  body: unknown,
): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

before(
  () =>
    new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server?.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    }),
);

after(async () => {
  if (createdProductIds.length > 0) {
    await prisma.product.deleteMany({
      where: { id: { in: createdProductIds } },
    });
  }

  await prisma.$disconnect();

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('parcours complet de gestion d’un produit', async () => {
  const listResponse = await fetch(`${baseUrl}/api/products`);
  const products = await readJson<ProductResponse[]>(listResponse);

  assert.equal(listResponse.status, 200);
  assert.ok(Array.isArray(products));

  const invalidResponse = await sendJson('/api/products', 'POST', {
    name: '',
  });
  assert.equal(invalidResponse.status, 400);

  const reference = `TEST-API-${Date.now()}`;
  const productInput = {
    name: 'Produit de test',
    reference,
    description: 'Supprimé automatiquement après le test.',
    category: 'Tests',
    quantity: 5,
    alertThreshold: 2,
  };

  const createResponse = await sendJson(
    '/api/products',
    'POST',
    productInput,
  );
  const createdProduct = await readJson<ProductResponse>(createResponse);
  createdProductIds.push(createdProduct.id);

  assert.equal(createResponse.status, 201);
  assert.equal(createdProduct.reference, reference);

  const duplicateResponse = await sendJson(
    '/api/products',
    'POST',
    productInput,
  );
  assert.equal(duplicateResponse.status, 409);

  const detailResponse = await fetch(
    `${baseUrl}/api/products/${createdProduct.id}`,
  );
  const productDetail = await readJson<ProductResponse>(detailResponse);

  assert.equal(detailResponse.status, 200);
  assert.equal(productDetail.id, createdProduct.id);

  const updateResponse = await sendJson(
    `/api/products/${createdProduct.id}`,
    'PUT',
    { ...productInput, name: 'Produit modifié' },
  );
  const updatedProduct = await readJson<ProductResponse>(updateResponse);

  assert.equal(updateResponse.status, 200);
  assert.equal(updatedProduct.name, 'Produit modifié');

  const entryResponse = await sendJson(
    `/api/products/${createdProduct.id}/stock`,
    'PATCH',
    { type: 'IN', quantity: 3 },
  );
  const productAfterEntry = await readJson<ProductResponse>(entryResponse);

  assert.equal(entryResponse.status, 200);
  assert.equal(productAfterEntry.quantity, 8);

  const exitResponse = await sendJson(
    `/api/products/${createdProduct.id}/stock`,
    'PATCH',
    { type: 'OUT', quantity: 2 },
  );
  const productAfterExit = await readJson<ProductResponse>(exitResponse);

  assert.equal(exitResponse.status, 200);
  assert.equal(productAfterExit.quantity, 6);

  const excessiveExitResponse = await sendJson(
    `/api/products/${createdProduct.id}/stock`,
    'PATCH',
    { type: 'OUT', quantity: 100 },
  );
  const excessiveExitBody = await readJson<{ error: string }>(
    excessiveExitResponse,
  );

  assert.equal(excessiveExitResponse.status, 400);
  assert.equal(excessiveExitBody.error, 'Le stock disponible est insuffisant.');

  const missingResponse = await fetch(
    `${baseUrl}/api/products/00000000-0000-0000-0000-000000000000`,
  );
  assert.equal(missingResponse.status, 404);
});
