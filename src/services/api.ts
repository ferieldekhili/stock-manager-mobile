import type {
  CreateProductInput,
  Product,
  StockMovementInput,
  UpdateProductInput,
} from '../types/product';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      "Impossible de joindre le serveur. Vérifiez que l'API est démarrée et que le téléphone est sur le même réseau Wi-Fi.",
    );
  }

  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    // Une réponse vide ou invalide sera gérée avec le statut HTTP ci-dessous.
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string'
        ? body.error
        : 'Une erreur est survenue pendant la requête.';

    throw new ApiError(response.status, message);
  }

  return body as T;
}

function jsonRequest(method: 'POST' | 'PUT' | 'PATCH', body: unknown): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export function getProducts(): Promise<Product[]> {
  return request<Product[]>('/api/products');
}

export function getProduct(productId: string): Promise<Product> {
  return request<Product>(`/api/products/${encodeURIComponent(productId)}`);
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return request<Product>('/api/products', jsonRequest('POST', input));
}

export function updateProduct(
  productId: string,
  input: UpdateProductInput,
): Promise<Product> {
  return request<Product>(
    `/api/products/${encodeURIComponent(productId)}`,
    jsonRequest('PUT', input),
  );
}

export function updateStock(
  productId: string,
  input: StockMovementInput,
): Promise<Product> {
  return request<Product>(
    `/api/products/${encodeURIComponent(productId)}/stock`,
    jsonRequest('PATCH', input),
  );
}
