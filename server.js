const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const predictRouter = require("./routes/predictRoutes");
const loadModel = require("./models/modelLoader");
const cors = require("cors");

dotenv.config();

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: "http://localhost:3000", // Ganti dengan URL frontend Anda
    credentials: true,
  })
);



const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// app.listen(PORT, HOST, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

(async () => {
  // Muat model sebelum server mulai
  const model = await loadModel();
  app.locals.model = model; // Simpan model di app.locals

  
  app.use("/auth", authRoutes);
  app.use("/predict", predictRouter);

  // Jalankan server setelah model berhasil dimuat
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();