const express = require("express");
const {
  googleAuth,
  googleCallback,
  register,
  login,
  changePassword,
  logout,
  getProfile,
  editProfile,
  upload,
  getAllUsers,
  getLeaderboard,
} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/changePassword", verifyToken, changePassword);
router.post("/logout", logout);
router.put("/editProfile", verifyToken, upload.single("file"), editProfile);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/profile", verifyToken, getProfile);
router.get("/allUsers", getAllUsers);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
