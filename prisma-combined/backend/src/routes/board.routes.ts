import { Router } from "express";
import * as boardController from "../controllers/board.controller.js";
import * as listController from "../controllers/list.controller.js";

const router = Router();

router.post("/board", boardController.createBoard);
router.get("/boards", boardController.getBoards);
router.get("/board/:id", boardController.getBoard);
router.post("/board/:id/lists", listController.createList);

export default router;
