"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/rewardRoutes.ts
const express_1 = __importDefault(require("express"));
const rewardController_1 = require("../controllers/rewardController");
const router = express_1.default.Router();
// POST /api/rewards/claim - Claim a token reward
router.post('/claim', rewardController_1.claimReward);
exports.default = router;
