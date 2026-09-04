import { Router } from 'express';

import {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  updateStock,
} from '../controllers/product.controller';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProduct);
productRouter.post('/', createProduct);
productRouter.put('/:id', updateProduct);
productRouter.patch('/:id/stock', updateStock);

export default productRouter;
