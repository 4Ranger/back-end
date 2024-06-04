const jwt = require("jsonwebtoken");
const { admin } = require("../config/firebaseConfig");

const verifyToken = (req, res, next) => {
  let token = req.cookies.token || req.headers["authorization"];

  console.log("Token received:", token); // Log token untuk debug

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  // Jika token diawali dengan 'Bearer ', hapus prefix tersebut
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trimLeft();
  }

  // Menggunakan kunci rahasia dari variabel lingkungan untuk verifikasi
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ["HS256"] },
    async (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("Decoded token:", decoded); // Log decoded token untuk debug

      try {
        const user = await admin.auth().getUser(decoded.uid);
        req.user = user;
        next();
      } catch (error) {
        console.error("User authentication failed:", error);
        res.status(500).json({ error: "Failed to authenticate user" });
      }
    }
  );
};

module.exports = verifyToken;
