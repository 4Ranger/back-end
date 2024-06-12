const tf = require('@tensorflow/tfjs-node');
const path = require('path');

async function loadModel() {
    try {
        const modelUrl = process.env.MODEL_URL;
        if (!modelUrl) {
            throw new Error('MODEL_URL environment variable is not set');
        }

        const model = await tf.loadLayersModel(modelUrl);
        console.log('Model loaded successfully from Cloud Storage');
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        process.exit(1); // Keluar dari proses jika model gagal dimuat
    }
}

module.exports = loadModel;