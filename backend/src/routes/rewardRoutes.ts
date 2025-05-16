// backend/src/routes/rewardRoutes.ts
import express from 'express';
import { claimReward } from '../controllers/rewardController';

const router = express.Router();

// POST /api/rewards/claim - Claim a token reward
router.post('/claim', claimReward);

export default router;