from Translators import Translators
from DementiaDetection import DementiaDetection

# 中文轉英文
translators = Translators()
text = translators.chineseToEnglish("今天天氣真好")
print(text)

# 失智辨識
dementiaDetection = DementiaDetection()
result = dementiaDetection.detection(text="hello my name is tony")
print(result)