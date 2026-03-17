import { Router } from 'express';
import { getFilters, getRoiData } from '../controllers/roiController';

const router = Router();

// GET /api/filters - 获取筛选项枚举
router.get('/filters', getFilters);

// GET /api/roi - 查询 ROI 数据
router.get('/roi', getRoiData);

export default router;
