import express from "express";
import { addUserRole, loginEmail, loginUser, myProfile, signupEmail, updateProfile } from "../controllers/auth.js";

import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/email-login", loginEmail);
router.post("/email-signup", signupEmail);
router.put("/add/role", isAuth, addUserRole);
router.put("/update", isAuth, updateProfile);
router.get("/me", isAuth, myProfile);


export default router;
