import { Router } from "express";
import * as workspaceController from "../controllers/workspace.controller.js";

const router = Router();

router.post("/workspace", workspaceController.createWorkspace);
router.get("/workspaces", workspaceController.getWorkspaces);
router.get("/workspace/:id", workspaceController.getWorkspace);
router.get("/workspaces/:id/stats", workspaceController.getWorkspaceStats);

export default router;
