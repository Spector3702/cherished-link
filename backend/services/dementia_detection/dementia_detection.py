import torch
import logging
import assemblyai as aai

from datetime import datetime
from deep_translator import GoogleTranslator
from transformers import AutoTokenizer, XLMRobertaForSequenceClassification

from services.mongo_db import MongoDB

logging.basicConfig(level=logging.INFO)


class DementiaDetection():
    def __init__(self, user) -> None:
        self.user = user
        self.db = MongoDB(host="localhost", port=27017, db='cherished-link')
        self.translator = GoogleTranslator(source='zh-TW', target='en')
        self.tokenizer = AutoTokenizer.from_pretrained("vjsyong/xlm-roberta-dementia_detection")
        self.model = XLMRobertaForSequenceClassification.from_pretrained("vjsyong/xlm-roberta-dementia_detection", from_tf=True)

    def _speech2text(self, file_path):
        aai.settings.api_key = "4ac7d2d57d97426e92455f47feafcf08"
        config = aai.TranscriptionConfig(language_code="zh")
        transcriber = aai.Transcriber(config=config)

        transcript = transcriber.transcribe(file_path)
        text = transcript.text

        logging.info(f"Text recognized: {text}")
        return text

    def _chineseToEnglish(self, text: str) -> str:
        english = self.translator.translate(text)

        logging.info(f"Translated English: {english}")
        return english
    
    def _save_db(self, content, translationContent, detection):
        result = {
            "user": self.user,
            "content": content,
            "translationContent": translationContent,
            "detection": detection,
            "createTime": str(datetime.now())
        }
        self.db.save('DementiaDetection', result)

    def detection(self, file_path) -> int:
        chinese = self._speech2text(file_path)
        english = self._chineseToEnglish(chinese)

        inputs = self.tokenizer(english, return_tensors="pt")
        with torch.no_grad():
            logits = self.model(**inputs).logits # type: ignore
            predicted_class_id = logits.argmax().item()

        self._save_db(chinese, english, predicted_class_id)
        
        return predicted_class_id

