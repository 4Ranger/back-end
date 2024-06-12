// const tf = require('@tensorflow/tfjs-node');
// const { db, bucket } = require('../config/firebaseConfig');
// const recommendations = require('./recommendations');
// const { format } = require('util');

// async function predictImage(req, res) {
//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }

//     // Proses gambar menggunakan TensorFlow.js
//     const imageBuffer = req.file.buffer;
//     const imageTensor = tf.node.decodeImage(imageBuffer);

//     // Normalisasi nilai piksel menjadi antara 0 dan 1
//     const normalizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]).div(tf.scalar(255.0)).expandDims();

//     // Prediksi menggunakan model
//     const model = req.app.locals.model; // Model dari app.locals
//     const rawPrediction = model.predict(normalizedImage);
//     const prediction = rawPrediction.softmax().dataSync();

//     // Prediksi kelas (6 kelas)
//     const classes = ['kardus', 'kaca', 'logam', 'kertas', 'plastik', 'organik'];
//     const predictedClass = classes[prediction.indexOf(Math.max(...prediction))];

//     // Ambil rekomendasi untuk kelas yang diprediksi
//     const classRecommendations = recommendations[predictedClass];

//     // Unggah gambar ke Cloud Storage
//     const fileName = `predictions/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
//     const file = bucket.file(fileName);
//     const stream = file.createWriteStream({
//       metadata: {
//         contentType: req.file.mimetype
//       }
//     });

//     // Menangani kesalahan saat mengunggah
//     stream.on('error', (err) => {
//       console.error('Error uploading to Cloud Storage:', err);
//       res.status(500).send(err);
//     });

//     // Menangani keberhasilan saat mengunggah
//     stream.on('finish', async () => {
//       // Buat file menjadi publik
//       await file.makePublic();
//       const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${file.name}`);

//       // Konversi prediksi ke objek JavaScript biasa
//       const predictionObject = {};
//       prediction.forEach((value, index) => {
//         predictionObject[`class_${index}`] = value;
//       });

//       // Menyimpan prediksi ke Firestore
//       const docRef = db.collection('predictions').doc();
//       await docRef.set({
//         prediction: predictionObject,
//         predictedClass,
//         recommendations: classRecommendations,
//         imageUrl: publicUrl,
//         timestamp: new Date()
//       });

//       res.json({
//         prediction: predictionObject,
//         predictedClass,
//         recommendations: classRecommendations,
//         imageUrl: publicUrl
//       });
//     });

//     // Mulai streaming file
//     stream.end(imageBuffer);
//   } catch (error) {
//     res.status(500).send(error.toString());
//   }
// }

// module.exports = { predictImage };


const tf = require('@tensorflow/tfjs-node');
const { db, bucket } = require('../config/firebaseConfig');
const recommendations = require('./recommendations');
const { format } = require('util');
const { addPredictionToHistory } = require('./historyController');

async function predictImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Proses gambar menggunakan TensorFlow.js
    const imageBuffer = req.file.buffer;
    const imageTensor = tf.node.decodeImage(imageBuffer);

    // Normalisasi nilai piksel menjadi antara 0 dan 1
    const normalizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]).div(tf.scalar(255.0)).expandDims();

    // Prediksi menggunakan model
    const model = req.app.locals.model; // Model dari app.locals
    const rawPrediction = model.predict(normalizedImage);
    const prediction = rawPrediction.softmax().dataSync();

    // Prediksi kelas (6 kelas)
    const classes = ['kardus', 'kaca', 'logam', 'kertas', 'plastik', 'organik'];
    const predictedClass = classes[prediction.indexOf(Math.max(...prediction))];

    // Ambil rekomendasi untuk kelas yang diprediksi
    const classRecommendations = recommendations[predictedClass];

    // Unggah gambar ke Cloud Storage
    const fileName = `predictions/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    // Menangani kesalahan saat mengunggah
    stream.on('error', (err) => {
      console.error('Error uploading to Cloud Storage:', err);
      res.status(500).send(err);
    });

    // Menangani keberhasilan saat mengunggah
    stream.on('finish', async () => {
      // Buat file menjadi publik
      await file.makePublic();
      const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${file.name}`);

      // Konversi prediksi ke objek JavaScript biasa
      const predictionObject = {};
      prediction.forEach((value, index) => {
        predictionObject[`class_${index}`] = value;
      });

      // Menyimpan prediksi ke Firestore
      const docRef = db.collection('predictions').doc();
      await docRef.set({
        prediction: predictionObject,
        predictedClass,
        recommendations: classRecommendations,
        imageUrl: publicUrl,
        timestamp: new Date()
      });

      // Tambahkan ID prediksi ke dalam riwayat pengguna
      await addPredictionToHistory(req.user.uid, docRef.id);

      res.json({
        prediction: predictionObject,
        predictedClass,
        recommendations: classRecommendations,
        imageUrl: publicUrl
      });
    });

    // Mulai streaming file
    stream.end(imageBuffer);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

module.exports = { predictImage };
