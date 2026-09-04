import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ error: 'Route introuvable.' });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'Le corps JSON est invalide.' });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      response.status(409).json({ error: 'Cette référence est déjà utilisée.' });
      return;
    }

    if (error.code === 'P2025') {
      response.status(404).json({ error: 'Produit introuvable.' });
      return;
    }

    if (error.code === 'P2004') {
      response.status(400).json({ error: 'La valeur du stock est invalide.' });
      return;
    }
  }

  console.error('Unhandled server error', error);
  response.status(500).json({ error: 'Une erreur interne est survenue.' });
};
