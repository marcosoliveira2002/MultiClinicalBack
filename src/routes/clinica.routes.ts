import { Router } from "express";
import { ClinicaController } from "../controllers/clinica.controller";
import { auth } from "../middlewares/auth";


const router = Router();


router.post("/", auth, ClinicaController.create);
router.get("/", auth, ClinicaController.list);
router.get("/:id", auth, ClinicaController.getById);
router.put("/:id", auth, ClinicaController.update);
router.patch("/:id/inativar", auth, ClinicaController.inativar);
router.patch("/:id/ativar", auth, ClinicaController.ativar);


export default router; 