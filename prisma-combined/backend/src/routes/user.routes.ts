import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.post("/user", userController.createUser);
router.get("/users", userController.getUsers);

export default router;
