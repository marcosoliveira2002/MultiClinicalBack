import { Router } from "express";

import { auth } from "../middlewares/auth";
import { DashboardController } from "@/controllers/dashboard.controller";

const router = Router();

// GET /dashboard?inicio=2025-09-01&fim=2025-09-30
router.get("/dashboard", auth, DashboardController.getDashboard);

export default router;
