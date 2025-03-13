import express from "express";

import { protect } from "../middleware/auth";
import {
  getMe,
  login,
  logout,
  register,
  resetPassword,
  updateDetails,
  updatePassword,
  forgotPassword,
  sendVerificationCode,
  verifyUser,
} from "../controllers/auth";

const router = express.Router({ mergeParams: true });

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.post("/sendverificationcode", sendVerificationCode);
router.put("/verifyuser", verifyUser);

export default router;
