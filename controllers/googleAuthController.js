const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
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

router.get("/auth/google", (req, res) => {
  res.redirect(authorizationUrl);
});

router.get("/auth/google/callback", async (req, res) => {
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
    res.redirect("/profile"); // Redirect to profile or any desired route after login
  } catch (error) {
    console.error("Error during Google login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
