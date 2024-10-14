import { Router } from "express";
import { sendEmail } from "../controllers/sendemail.controllers.js";

const router = Router();

router.route("/").post(sendEmail)


export default router