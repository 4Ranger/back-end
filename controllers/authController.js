const { admin, db, bucket } = require("../config/firebaseConfig");
const generateToken = require("../utils/generateToken");
const axios = require("axios");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ message: "User registered successfully", token });
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
    const token = jwt.sign(
      { uid: localId, email: email },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful", token: token });
  } catch (error) {
    console.error("Login error:", error.message); // Debugging: log error
    res.status(400).json({ error: "Invalid credentials" });
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
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      ...userData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    // Dapatkan token JWT dari cookie
    const token = req.cookies.token;

    // Periksa apakah token JWT tersedia
    if (!token) {
      return res.status(401).json({ error: "JWT token is missing" });
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
      const fileName = `${uid}_${Date.now()}_${encodeURIComponent(
        file.originalname
      )}`;
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
          return res
            .status(400)
            .json({ error: "Generated photo URL is invalid" });
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

        res
          .status(200)
          .json({ message: "Profile updated successfully", url: publicUrl });
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

module.exports = { register, login, logout, editProfile, upload, getProfile };
