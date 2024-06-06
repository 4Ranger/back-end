const express = require("express");
const {
  googleAuth,
  googleCallback,
  register,
  login,
  logout,
  getProfile,
  editProfile,
  upload,
} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/editProfile", verifyToken, upload.single("file"), editProfile);
router.get("/profile", verifyToken, getProfile);

module.exports = router;
