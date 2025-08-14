import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const dbPath = path.join(__dirname, '../../data/pharma.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables
  await createTables();
  // Seed initial data from JSON files
  await seedInitialData();
  return db;
}

async function createTables() {
  if (!db) return;

  // Products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      strength TEXT,
      unit_pack TEXT,
      pack_size INTEGER,
      rate_usd REAL,
      hs_code TEXT,
      batch_prefix TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Customers table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      order_number TEXT UNIQUE,
      order_date DATE,
      estimated_shipment_date DATE,
      status TEXT DEFAULT 'pending',
      total_amount REAL,
      currency TEXT DEFAULT 'USD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Order items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      product_id TEXT,
      quantity INTEGER,
      rate_usd REAL,
      amount REAL,
      batch_number TEXT,
      mfg_date DATE,
      exp_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Invoices table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      invoice_number TEXT UNIQUE,
      invoice_date DATE,
      invoice_type TEXT, -- 'proforma', 'commercial'
      due_date DATE,
      subtotal REAL,
      igst REAL DEFAULT 0,
      drawback REAL DEFAULT 0,
      rodtep REAL DEFAULT 0,
      total_amount REAL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  // Packing lists table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS packing_lists (
      id TEXT PRIMARY KEY,
      packing_list_number TEXT UNIQUE,
      order_id TEXT,
      invoice_id TEXT,
      shipping_date DATE,
      manufacturing_site TEXT,
      status TEXT DEFAULT 'pending',
      total_shippers INTEGER,
      total_gross_weight REAL,
      total_net_weight REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  // Packing list items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS packing_list_items (
      id TEXT PRIMARY KEY,
      packing_list_id TEXT,
      product_id TEXT,
      quantity INTEGER,
      shipper_quantity INTEGER,
      gross_weight REAL,
      net_weight REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (packing_list_id) REFERENCES packing_lists(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

/**
 * Load JSON data files and insert into the database if not exists
 */
async function seedInitialData() {
  if (!db) return;
  console.log('🔄 Seeding initial data into SQLite...');
  try {
  const dataDir = path.join(__dirname, '../../data');
  // Seed customers
  const custFile = path.join(dataDir, 'customers.json');
  if (fs.existsSync(custFile)) {
    const customers = JSON.parse(fs.readFileSync(custFile, 'utf8'));
    for (const c of customers) {
      await db.run(
        `INSERT OR IGNORE INTO customers (id, company_name, contact_person, address, city, country, phone, email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        c.id,
        c.companyName || c.company_name,
        c.contactPerson || c.contact_person || null,
        typeof c.address === 'object' ? c.address.street : c.address || null,
        c.address?.city || c.city || null,
        c.address?.country || c.country || null,
        c.phone || null,
        c.email || null
      );
    }
  }
  // Seed products
  const prodFile = path.join(dataDir, 'products.json');
  if (fs.existsSync(prodFile)) {
    const products = JSON.parse(fs.readFileSync(prodFile, 'utf8'));
    for (const p of products) {
      await db.run(
        `INSERT OR IGNORE INTO products (id, brand_name, generic_name, strength, unit_pack, rate_usd, hs_code, batch_prefix)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        p.id,
        p.brandName || p.brand_name,
        p.genericName || p.generic_name,
        p.strength || null,
        p.dosageForm || p.unit_pack || null,
        p.unitPrice ?? p.rate_usd ?? null,
        p.hsnCode || p.hs_code || null,
        p.productCode || p.batch_prefix || null
      );
    }
  }
  // Seed orders and order_items
  const orderFile = path.join(dataDir, 'orders.json');
  if (fs.existsSync(orderFile)) {
    const ordersData = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
    for (const o of ordersData) {
      // Insert order
      await db.run(
        `INSERT OR IGNORE INTO orders (id, customer_id, order_number, order_date, estimated_shipment_date, status, total_amount, currency)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        o.id,
        o.customerId,
        o.orderNumber || o.order_number,
        (o.orderDate || o.order_date || '').split('T')[0] || null,
        (o.deliveryDate || o.estimatedShipmentDate || '').split('T')[0] || null,
        o.status || 'pending',
        o.totalAmount ?? o.total_amount ?? 0,
        o.currency || 'USD'
      );
      // Insert order items
      if (Array.isArray(o.items)) {
        for (const it of o.items) {
          const itemId = it.id || uuidv4();
          await db.run(
            `INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, rate_usd, amount, batch_number, mfg_date, exp_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            itemId,
            o.id,
            it.productId,
            it.quantity,
            it.unitPrice ?? it.rate_usd ?? 0,
            it.totalPrice ?? it.amount ?? 0,
            it.batchNumber || it.batch_number || null,
            it.manufacturingDate?.split('T')[0] || null,
            it.expiryDate?.split('T')[0] || it.expDate?.split('T')[0] || null
          );
        }
      }
    }
    }
    // Seed simple packing list entries for each order
    console.log('🔄 Seeding packing lists for orders...');
    const ordersForPl = await db.all(`SELECT id, order_number, estimated_shipment_date FROM orders`);
    for (const o of ordersForPl) {
      const plId = uuidv4();
      const plNumber = o.order_number.replace(/[/\\]/g, '-') + '-' + 'PL';
      await db.run(
        `INSERT OR IGNORE INTO packing_lists (id, packing_list_number, order_id, shipping_date, manufacturing_site, status, total_shippers, total_gross_weight, total_net_weight)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        plId,
        plNumber,
        o.id,
        o.estimated_shipment_date || null,
        'Site A - India',
        'confirmed',
        0,
        0,
        0
      );
    }
    console.log('✅ Seeding packing lists complete');
    console.log('✅ Seeding initial data complete');
  } catch (error) {
    console.error('❌ Error during seeding initial data:', error);
  }
}