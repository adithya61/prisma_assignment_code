import { Router } from "express";
import * as listController from "../controllers/list.controller.js";
import * as cardController from "../controllers/card.controller.js";

const router = Router();

router.get("/list/:boardId", listController.getListByBoard);
router.get("/list/:id", listController.getList);
router.post("/list/:id/card", cardController.createCard);

export default router;
