import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { packingListService } from '../services/packing-list.service';
import { getDatabase } from '../config/sqlite.config';
import { z } from 'zod';

const generatePackingListSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    invoiceId: z.string().uuid().optional(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().positive(),
      packagesCount: z.number().positive(),
      grossWeight: z.number().positive(),
      netWeight: z.number().positive(),
      dimensions: z.string().optional(),
      batchNumber: z.string(),
    })).min(1),
    containerNumber: z.string().optional(),
    sealNumber: z.string().optional(),
    shippingMarks: z.string(),
  }),
});

export const generatePackingList = asyncHandler(async (
  req: Request<{}, {}, z.infer<typeof generatePackingListSchema>['body']>,
  res: Response
) => {
  const packingList = await packingListService.generatePackingList(req.body);
  
  res.status(201).json({
    status: 'success',
    data: packingList,
  });
});

export const getPackingList = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const packingList = await packingListService.getPackingList(req.params.id);
  
  res.json({
    status: 'success',
    data: packingList,
  });
});

export const listPackingLists = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const db = await getDatabase();
  const lists = await db.all(`
    SELECT
      pl.id,
      pl.packing_list_number AS packingListNumber,
      pl.order_id AS orderId,
      o.order_number AS orderNumber,
      pl.invoice_id AS invoiceId,
      i.invoice_number AS invoiceNumber,
      c.company_name AS customerName,
      c.country AS customerCountry,
      pl.manufacturing_site AS manufacturingSite,
      pl.shipping_date AS shippingDate,
      pl.status,
      pl.total_shippers AS totalShippers,
      pl.total_gross_weight AS totalGrossWeight,
      pl.total_net_weight AS totalNetWeight
    FROM packing_lists pl
    LEFT JOIN orders o ON pl.order_id = o.id
    LEFT JOIN invoices i ON pl.invoice_id = i.id
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY pl.created_at DESC
  `);
  res.json({ success: true, data: lists });
});