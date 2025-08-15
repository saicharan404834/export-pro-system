import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

import orderRoutes from '../bls-exportpro/backend/src/routes/order.routes';
import invoiceRoutes from '../bls-exportpro/backend/src/routes/invoice.routes';
import packingListRoutes from '../bls-exportpro/backend/src/routes/packing-list.routes';
import purchaseOrderRoutes from '../bls-exportpro/backend/src/routes/purchase-order.routes';
import regulatoryRoutes from '../bls-exportpro/backend/src/routes/regulatory.routes';
import dashboardRoutes from '../bls-exportpro/backend/src/routes/dashboard.routes';
import excelRoutes from '../bls-exportpro/backend/src/routes/excel.routes';
import customerRoutes from '../bls-exportpro/backend/src/routes/customers';
import productRoutes from '../bls-exportpro/backend/src/routes/products';
import documentRoutes from '../bls-exportpro/backend/src/routes/document.routes';
import invoiceGeneratorRoutes from '../bls-exportpro/backend/src/routes/invoice-generator.routes';
import orderCreationRoutes from '../bls-exportpro/backend/src/routes/order-creation.routes';
import excelImportRoutes from '../bls-exportpro/backend/src/routes/excel-import.routes';

import { errorHandler, notFound } from '../bls-exportpro/backend/src/middleware/error.middleware';

dotenv.config();

const app = express();
const API_PREFIX = process.env.API_PREFIX || '/api';

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'serverless',
    service: 'BLS ExportPro Backend'
  });
});

// Mount routes
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/invoices`, invoiceRoutes);
app.use(`${API_PREFIX}/packing-list`, packingListRoutes);
app.use(`${API_PREFIX}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API_PREFIX}/regulatory`, regulatoryRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/reports/export`, excelRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/documents`, documentRoutes);
app.use(`${API_PREFIX}/invoice-generator`, invoiceGeneratorRoutes);
app.use(`${API_PREFIX}/order-creation`, orderCreationRoutes);
app.use(`${API_PREFIX}/excel-import`, excelImportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
