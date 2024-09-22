# DementiaDetection

This is a Python-based solution for detecting dementia symptoms from spoken Chinese language files. The application transcribes the speech to text, translates the text from Chinese to English, and performs a classification task using a pre-trained XLM-Roberta model to detect dementia likelihood.

## Setup
1. **MongoDB Configuration**: The class connects to a MongoDB instance for saving user data. Ensure that your MongoDB is configured as per the following parameters:
    * Host: localhost
    * Account: root
    * Password: 1234
    * Port: 27017
    You can modify the MongoDB connection details in the constructor of the DementiaDetection class if needed.
2. **AssemblyAI API Key**: Get your API key from AssemblyAI and insert it into the _speech2text method by replacing the string "53bdbc097f794bf58e72af39cd84862c".
3. **Pre-trained Model**: The code uses a pre-trained XLM-Roberta model (vjsyong/xlm-roberta-dementia_detection) hosted on Hugging Face. The model should be downloaded automatically when running the code for the first time.

## How It Works
1. **Speech-to-Text**: The file is processed using AssemblyAI's speech-to-text API to extract Chinese text from the audio file. The recognized text is logged for review.
2. **Translation**: The recognized Chinese text is translated to English using the deep-translator package's GoogleTranslator class. The translation is logged as well.
3. **Dementia Detection**: The translated text is tokenized and passed through a pre-trained XLM-Roberta model. The model returns the logits, and the predicted class (detection) is extracted using argmax. This class is returned as the result of the dementia detection.
4. **Save to MongoDB**: The original content, the translated content, and the detection result are saved in the MongoDB database for future reference.

## Code Usage
1. Instantiating the Class:
    ```python
    detector = DementiaDetection(user="test_user")
    ```
2. Running Detection:
    ```python
    result = detector.detection("path_to_audio_file.wav")
    print(f"Dementia Detection Result: {result}")
    ```
    > Where result can be:
    > - `0`: No dementia detected.
    > - `1`: Dementia detected.

## License
This project is licensed under the MIT License.