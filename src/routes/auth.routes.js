import { Router } from "express";
import {registerUser,loginUser,getMe,refreshToken,logout,logoutAll,verifyEmail} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", getMe);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", logoutAll);
authRouter.post("/verify-email", verifyEmail)
export default authRouter;