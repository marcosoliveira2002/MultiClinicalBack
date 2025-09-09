import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller";
import { auth } from "../middlewares/auth";


const router = Router();


router.post("/", auth, ClienteController.create);
router.get("/", auth, ClienteController.list);
router.get("/:id", auth, ClienteController.getById);
router.put("/:id", auth, ClienteController.update);
router.patch("/:id/inativar", auth, ClienteController.inativar);
router.patch("/:id/ativar", auth, ClienteController.ativar);


export default router;