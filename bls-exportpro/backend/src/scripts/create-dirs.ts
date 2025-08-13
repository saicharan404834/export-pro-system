import fs from 'fs';
import path from 'path';

const dirs = [
    './uploads',
    './uploads/invoices',
    './uploads/packing-lists',
    './uploads/purchase-orders',
    './uploads/temp',
    './uploads/excel',
    './data'
];

console.log('Creating required directories...');

dirs.forEach(dir => {
    const fullPath = path.resolve(__dirname, '../../', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
    } else {
        console.log(`Directory already exists: ${fullPath}`);
    }
});

console.log('Directory setup complete!');
