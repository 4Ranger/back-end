const { db } = require('../config/firebaseConfig');
const admin = require('firebase-admin');

// Menambahkan prediksi ke history user
async function addPredictionToHistory(userId, predictionId) {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      history: admin.firestore.FieldValue.arrayUnion(predictionId)
    });
  } catch (error) {
    throw new Error('Error adding prediction to history: ' + error.message);
  }
}

// Mengambil history prediksi user
async function getPredictionHistory(req, res) {
  try {
    const userId = req.user.uid;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const userHistory = userDoc.data().history || [];
    const predictions = [];

    for (const predictionId of userHistory) {
      const predictionDoc = await db.collection('predictions').doc(predictionId).get();
      if (predictionDoc.exists) {
        predictions.push({ id: predictionDoc.id, ...predictionDoc.data() });
      }
    }

    res.json(predictions);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

module.exports = { getPredictionHistory, addPredictionToHistory };
