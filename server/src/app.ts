import express from 'express';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import productRouter from './routes/product.routes';

const app = express();

app.use(express.json({ limit: '100kb' }));

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/products', productRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
