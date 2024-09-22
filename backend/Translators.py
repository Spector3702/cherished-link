from deep_translator import GoogleTranslator

class Translators():
    def __init__(self) -> None:
        self.translator = GoogleTranslator(source='zh', target='en')

    def chineseToEnglish(self, text: str) -> str:
        return self.translator.translate(text)
