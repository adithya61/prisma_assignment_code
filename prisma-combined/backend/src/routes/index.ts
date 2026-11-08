import { Router } from "express";
import userRoutes from "./user.routes.js";
import workspaceRoutes from "./workspace.routes.js";
import boardRoutes from "./board.routes.js";
import listRoutes from "./list.routes.js";
import cardRoutes from "./card.routes.js";

const router = Router();

router.use(userRoutes);
router.use(workspaceRoutes);
router.use(boardRoutes);
router.use(listRoutes);
router.use(cardRoutes);

export default router;
