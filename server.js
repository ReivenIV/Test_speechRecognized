const express = require('express');
const app = express();
const dotenv = require("dotenv");
const { HTTP_STATUS } = require('./utils/constants');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

dotenv.config();
const cors = require('cors');
app.use(express.json({ limit: '10mb' }));
app.use(express.json());
app.use(cors());

// Routes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Perform speech recognition on a base64 encoded audio string.
 *
 * @return {Object} - The JSON object containing the recognized text.
 * 
 * @description This function uses the following body parameters:
 *              - `req.body.language` : A string representing the recognition language.
 *              - `req.body.audio_data` : The base64 encoded audio data to recognize.
 */
app.post('/vocal_recognition', async (req, res) => {

    // Check if the required parameters are provided
    if (!req.body.language || !req.body.audio_data) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Missing required parameters.' });
    }

    // Decode the base64 string to binary data
    const audioBuffer = Buffer.from(req.body.audio_data, 'base64');

    // Save the binary data to a temporary WAV file
    const tempFilePath = path.join(__dirname, `temp_wav/${req.body.user_id}temp.wav`);

 try {
    await saveAudioFileAsync(tempFilePath, audioBuffer);
    // Rest of your code
} catch (error) {
    console.error('Error writing audio data to file:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error.' });
}

    
    try {
        // Config
        const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.API_KEY, process.env.REGION);
        speechConfig.speechRecognitionLanguage = req.body.language;

        let audioConfig = sdk.AudioConfig.fromWavFileInput(tempFilePath);
        let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        speechRecognizer.recognizeOnceAsync(result => {
            switch (result.reason) {
                case sdk.ResultReason.RecognizedSpeech:
                    // Get the recognized text and send it as a response
                    const recognizedText = result.text;
                    res.status(HTTP_STATUS.OK).json({ data: recognizedText });
                    break;

                case sdk.ResultReason.NoMatch:
                    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Speech could not be recognized." });

                case sdk.ResultReason.Canceled:
                    const cancellation = sdk.CancellationDetails.fromResult(result);

                    if (cancellation.reason == sdk.CancellationReason.Error) {
                        console.error(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                        console.error(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error.' });
                    }

                    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Bad request.' });
            }
            speechRecognizer.close();

            // Clean up: Delete the temporary WAV file
            fs.unlinkSync(tempFilePath);
        });
    } catch (error) {
        console.error('Error processing audio data:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error.' });
    }
});

// Async function to save audio data to a file
function saveAudioFileAsync(filePath, audioBuffer) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, audioBuffer, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server has started at port " + PORT);
});
