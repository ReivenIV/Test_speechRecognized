import express from "express";
import dotenv from "dotenv";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import bodyParser from 'body-parser';
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(bodyParser.json());

// Routes

app.post("/vocal_recognition", async (req, res) => {

  // Check if the required parameters are provided
  if (!req.body.language.trim() || typeof req.body.audio_data !== "string") {
    return res
      .status(400)
      .json({ error: "Missing required parameters." });
  }

  if (!req.body.audio_data || typeof req.body.audio_data !== "string") {
    return res
      .status(400)
      .json({ error: "missing required audio_data" });
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
          return res.status(200).json({ data: recognizedText });

        case sdk.ResultReason.NoMatch:
          return res
            .status(404)
            .json({ error: "Speech could not be recognized." });

        case sdk.ResultReason.Canceled:
          const cancellation = sdk.CancellationDetails.fromResult(result);

          if (cancellation.reason == sdk.CancellationReason.Error) {
            console.error(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
            console.error(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
            return res
              .status(500)
              .json({ error: "Internal server error." });
          }

          return res.status(400).json({ error: "Bad request." });
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
