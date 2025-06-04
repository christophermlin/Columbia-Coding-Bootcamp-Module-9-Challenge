import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Serve index.html for all unmatched routes
router.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../../../client/index.html'));
});

export default router;
