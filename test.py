from Translators import Translators
from DementiaDetection import DementiaDetection
import requests

# 中文轉英文
# translators = Translators()
# text = translators.chineseToEnglish("今天天氣真好")
# print(text)

# 失智辨識
# dementiaDetection = DementiaDetection()
# result = dementiaDetection.detection(text="hello my name is tony")
# print(result)

# api
res = requests.post("http://localhost:5000/detection", json={"user": "tony", "content": "嗨"})
print(res.text)