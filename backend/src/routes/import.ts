import { Router } from 'express';
import multer from 'multer';
import { importCsv } from '../controllers/importController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/import - 上传并导入 CSV
router.post('/import', upload.single('file') as any, importCsv);

export default router;
