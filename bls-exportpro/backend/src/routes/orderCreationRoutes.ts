import express from 'express';

const router = express.Router();

router.get('/customers', (req, res) => {
  // sample customers with duplicate entries for testing deduplication
  res.json([
    { id: 'cust-1', company_name: 'Acme Inc', city: 'CityX', country: 'USA' },
    { id: 'cust-2', company_name: 'Globex Corp', city: 'CityY', country: 'UK' },
    { id: 'cust-1', company_name: 'Acme Inc', city: 'CityX', country: 'USA' }
  ]);
});

router.get('/products', (req, res) => {
  // sample products with duplicate entries for testing deduplication
  res.json([
    { id: 'prod-1', brand_name: 'Brand A', generic_name: 'Generic A', unit_pack: '10', rate_usd: 4.5, batch_prefix: 'A' },
    { id: 'prod-2', brand_name: 'Brand B', generic_name: 'Generic B', unit_pack: '5', rate_usd: 3.2, batch_prefix: 'B' },
    { id: 'prod-1', brand_name: 'Brand A', generic_name: 'Generic A', unit_pack: '10', rate_usd: 4.5, batch_prefix: 'A' }
  ]);
});

export default router;
