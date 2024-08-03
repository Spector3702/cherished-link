import torch
from transformers import AutoTokenizer, XLMRobertaForSequenceClassification

class DementiaDetection():
    def __init__(self) -> None:
        self.tokenizer = AutoTokenizer.from_pretrained("vjsyong/xlm-roberta-dementia_detection")
        self.model = XLMRobertaForSequenceClassification.from_pretrained("vjsyong/xlm-roberta-dementia_detection", from_tf=True)

    def detection(self, text) -> int:
        inputs = self.tokenizer(text, return_tensors="pt")
        with torch.no_grad():
            logits = self.model(**inputs).logits # type: ignore
            predicted_class_id = logits.argmax().item()
            return predicted_class_id

