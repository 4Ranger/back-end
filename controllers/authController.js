const dotenv = require("dotenv");
const { admin, db, bucket } = require("../config/firebaseConfig");
const generateToken = require("../utils/generateToken");
const axios = require("axios");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

const googleAuth = async (req, res) => {
  res.redirect(authorizationUrl);
};

const googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    const { email, name, picture } = data;

    // Check if the user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Create new user
        userRecord = await admin.auth().createUser({
          email: email,
          displayName: name,
        });

        // Save additional user data to Firestore
        await db.collection("users").doc(userRecord.uid).set({
          username: name,
          email: email,
          profilePhotoUrl: picture,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        throw error;
      }
    }

    // Generate JWT
    const TEN_YEARS_IN_SECONDS = 20 * 365 * 24 * 60 * 60;
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: TEN_YEARS_IN_SECONDS,
      }
    );

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/auth/profile"); // Redirect to profile or any desired route after login
  } catch (error) {
    console.error("Error during Google login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const userRecord = await admin
      .auth()
      .getUserByEmail(email)
      .catch((error) => {
        if (error.code !== "auth/user-not-found") {
          throw error;
        }
      });

    if (userRecord) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Create user in Firebase Authentication
    const user = await admin.auth().createUser({
      email: email,
      password: password, // Set original password here, Firebase handles hashing
      displayName: username,
    });

    // Save additional user data to Firestore
    await db.collection("users").doc(user.uid).set({
      username: username,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // const token = generateToken(user);
    // res.cookie("token", token, { httpOnly: true });
    // res.status(201).json({ message: "User registered successfully", token });
    res.status(201).json({ message: "User registered successfully"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifikasi password menggunakan Firebase Authentication REST API
    const apiKey = process.env.FIREBASE_API_KEY; // Set your Firebase API key in the .env file
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId } = response.data;

    // Get the user data from Firestore
    const userDoc = await db.collection("users").doc(localId).get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(400).json({ error: "User data not found" });
    }

    // Membuat token JWT menggunakan HS256
    const TEN_YEARS_IN_SECONDS = 20 * 365 * 24 * 60 * 60;
    const token = jwt.sign(
      { uid: localId, email: email },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: TEN_YEARS_IN_SECONDS,
      }
    );

    res.cookie("token", token, { httpOnly: true });
    // res.json({ message: "Login successful", token: token });
    res.json({
      error: false,
      message: "success",
      loginResult: {
        uid: localId,
        username: userData.username,
        token: token
      }
    });
  } catch (error) {
    console.error("Login error:", error.message); // Debugging: log error
    res.status(400).json({ error: "Invalid credentials" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // const token = req.cookies.token;

    // if (!token) {
    //   return res.status(401).json({ error: "JWT token is missing" });
    // }

    const authHeader = req.headers.authorization;

    // Periksa apakah header Authorization tersedia dan valid
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "JWT token is missing or invalid" });
    }

    // Ambil token dari header
    const token = authHeader.split(' ')[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const uid = decodedToken.uid;

    // Dapatkan email pengguna dari Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(400).json({ error: "User data not found" });
    }

    // Verifikasi kata sandi lama menggunakan Firebase Authentication REST API
    const apiKey = process.env.FIREBASE_API_KEY;
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email: userData.email,
        password: oldPassword,
        returnSecureToken: true,
      }
    );

    // Jika verifikasi kata sandi lama berhasil, perbarui kata sandi dengan yang baru
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  const { uid } = req.user;

  try {
    const userRecord = await admin.auth().getUser(uid);
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json({
      login : {
        error: false,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        ...userData,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    // Logging header Authorization untuk debugging
    // console.log('Authorization Header:', req.headers.authorization);

    // // Dapatkan token JWT dari header Authorization
    // const authHeader = req.headers.authorization;

    // // Periksa apakah header Authorization tersedia dan valid
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return res.status(401).json({ error: "JWT token is missing or invalid" });
    // }

    // // Ambil token dari header
    // const token = authHeader.split(' ')[1];

    // Dapatkan token JWT dari header Authorization atau cookies
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Periksa apakah token tersedia
    if (!token) {
      return res.status(401).json({ error: "JWT token is missing or invalid" });
    }

    // Dekode token JWT untuk mendapatkan informasi pengguna
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Identifikasi pengguna berdasarkan informasi yang diperoleh dari token
    const uid = decodedToken.uid;
    const { username, email } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    const updates = {
      displayName: username,
      email: email,
    };

    if (req.file) {
      const file = req.file;
      const fileName = `${uid}_${Date.now()}_${encodeURIComponent(file.originalname)}`;
      const fileUpload = bucket.file(fileName);

      console.log("Starting file upload for", fileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on("error", (error) => {
        console.error("Blob stream error:", error.message);
        res.status(500).json({ error: error.message });
      });

      blobStream.on("finish", async () => {
        let publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

        // Log the generated URL for debugging purposes
        console.log("Generated URL:", publicUrl);

        // Validate and clean the URL
        publicUrl = publicUrl.trim();
        if (!isValidURL(publicUrl)) {
          console.error("Invalid URL generated:", publicUrl);
          return res.status(400).json({ error: "Generated photo URL is invalid" });
        }

        updates.photoURL = publicUrl;

        console.log("Updating Firestore with new photoURL");

        await db.collection("users").doc(uid).update({
          username: username,
          email: email,
          profilePhotoUrl: publicUrl,
        });

        console.log("Updating Firebase Auth with new photoURL");

        await admin.auth().updateUser(uid, updates);

        res.status(200).json({ message: "Profile updated successfully", url: publicUrl });
      });

      blobStream.end(file.buffer);
    } else {
      console.log("No file uploaded, updating profile without photoURL");

      await db.collection("users").doc(uid).update({
        username: username,
        email: email,
      });

      await admin.auth().updateUser(uid, updates);

      res.status(200).json({ message: "Profile updated successfully" });
    }
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Function to validate URL
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

const getAllUsers = async (req, res) => {
  try {
    // Mengambil seluruh koleksi "users" dari Firestore
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "No users found" });
    }

    // Mengumpulkan data pengguna
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() });
    });

    // Mengembalikan daftar pengguna
    res.status(200).json({
      error: false,
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    // Mengambil seluruh koleksi "users" dari Firestore
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "No users found" });
    }

    // Mengumpulkan data pengguna dan menghitung panjang array history
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const historyCount = userData.history ? userData.history.length : 0;
      const historyPoints = historyCount * 10;
      users.push({ uid: doc.id, ...userData, historyCount, historyPoints });
    });

    // Mengurutkan pengguna berdasarkan jumlah item dalam array history secara menurun
    users.sort((a, b) => b.historyCount - a.historyCount);

    // Mengembalikan daftar pengguna sebagai leaderboard
    res.status(200).json({
      error: false,
      message: "Leaderboard retrieved successfully",
      leaderboard: users,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  register,
  login,
  changePassword,
  logout,
  editProfile,
  upload,
  getProfile,
  getAllUsers,
  getLeaderboard,
};
