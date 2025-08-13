import fs from 'fs';
import path from 'path';

export const logError = (error: any) => {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'error.log');
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${error.stack || error.message || error}\n`;

    fs.appendFileSync(logFile, errorMessage);
    console.error(errorMessage);
};
