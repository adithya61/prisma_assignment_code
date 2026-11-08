import { Router } from "express";
import * as cardController from "../controllers/card.controller.js";

const router = Router();

router.get("/cards", cardController.getCards);
router.patch("/cards/:id/move", cardController.moveCard);

export default router;
