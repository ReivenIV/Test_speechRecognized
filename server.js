import express from "express";
import dotenv from "dotenv";
import { HTTP_STATUS, CODE_ISO } from "./utils/constants.js";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import bodyParser from 'body-parser';
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(bodyParser.json());

// Routes

app.post("/v2/vocal_recognition", async (req, res) => {

  // Check if the required parameters are provided
  if (!req.body.language.trim() || !req.body.audio_data) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: "Missing required parameters." });
  }

  if (!isBase64(req.body.audio_data)) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: "audio_data isn't base64" });
  }
  
  // Decode the base64 string to binary data
  let audioBuffer = Buffer.from(req.body.audio_data, "base64");
  try {
    const speechRecognizer = configSpeech(audioBuffer, req.body.language);
    speechRecognizer.recognizeOnceAsync((result) => {
      switch (result.reason) {
        case sdk.ResultReason.RecognizedSpeech:
          // Get the recognized text and send it as a response
          const recognizedText = result.text;
          return res.status(HTTP_STATUS.OK).json({ data: recognizedText });

        case sdk.ResultReason.NoMatch:
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ error: "Speech could not be recognized." });

        case sdk.ResultReason.Canceled:
          const cancellation = sdk.CancellationDetails.fromResult(result);

          if (cancellation.reason == sdk.CancellationReason.Error) {
            console.error(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
            console.error(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
            return res
              .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
              .json({ error: "Internal server error." });
          }

          return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Bad request." });
      }
      speechRecognizer.close();

    });

  }catch (err) {
    console.error("error : ", err)
  }
});

const configSpeech = (buffer, language) => {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.KEY_AZURE,
    process.env.REGION,
  );
  speechConfig.speechRecognitionLanguage = language;
  const audioConfig = sdk.AudioConfig.fromWavFileInput(buffer);
  return new sdk.SpeechRecognizer(speechConfig, audioConfig);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server has started at port " + PORT);
});
