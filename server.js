import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import astraHandler from './api/astra.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing for API routes
app.use(express.json());

// Block access to sensitive files
app.use((req, res, next) => {
  const url = req.url.split('?')[0];
  if (url.includes('.env') || url.endsWith('.cjs') || url.endsWith('server.js') || url.includes('/api/')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for ASTRA API
app.all('/api/astra', async (req, res) => {
  await astraHandler(req, res);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.`);
});
