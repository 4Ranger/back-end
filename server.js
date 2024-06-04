const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Ganti dengan URL frontend Anda
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
