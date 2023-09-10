
# Vocal Recognition with Microsoft Cognitive Services Speech SDK

This repository contains an Express.js application that leverages the Microsoft Cognitive Services Speech SDK to perform vocal recognition. This allows you to transcribe spoken language from audio data using Azure Cognitive Services.

## Prerequisites

Before you can run this application, you'll need to set up the following:

1. **Azure Cognitive Services Subscription**: You'll need to obtain subscription keys and region information to use the Speech SDK. You can obtain these by signing up for the [Azure Cognitive Services Speech SDK](https://azure.microsoft.com/en-us/products/ai-services/ai-speech) and creating a subscription.

2. **Environment Variables**: Create a `.env` file in the project root directory with the following environment variables:

   ```
   KEY_AZURE=<Your Azure Cognitive Services Subscription Key>
   REGION=<Your Azure Region>
   PORT=<Port for the Express.js server, optional>
   ```

   Replace `<Your Azure Cognitive Services Subscription Key>` and `<Your Azure Region>` with your actual subscription key and region.

## Installation

1. Clone this repository to your local machine:

2. Navigate to the project directory:

3. Install the project dependencies:

   ```
   npm install
   ```

4. Start the Express.js server:

   ```
   npm start
   ```

The server will start on the port specified in your `.env` file or on port 5000 by default.

## Usage

To use the vocal recognition service, you can make a POST request to the `/v2/vocal_recognition` endpoint with the following JSON payload:

```json
{
  "language": "en-US", // Specify the language for recognition
  "audio_data": "base64-encoded-audio-data"
}
```

Replace `"en-US"` with the desired recognition language code, and `"base64-encoded-audio-data"` with your audio data encoded in base64.

The server will respond with the recognized text if successful.

## Error Handling

The application handles various error scenarios, such as missing parameters, invalid base64 data, recognition errors, and internal server errors. Ensure that you handle errors gracefully in your own use cases.

## Contributing

Feel free to contribute to this project by opening issues or creating pull requests. Contributions are welcome!

---
## [Reminder]
Make sure to replace `<Your Azure Cognitive Services Subscription Key>` and `<Your Azure Region>` with your actual Azure subscription key and region in the `.env` setup section. You can also customize the README further to include additional information about the project, dependencies, and any specific instructions for running or deploying it.