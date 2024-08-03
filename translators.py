from googletrans import Translator

class Translators():
    def __init__(self) -> None:
        self.translator = Translator()

    def chineseToEnglish(self, text: str) -> str:
        trans = self.translator.translate(text, dest='en')
        return trans.text # type: ignore