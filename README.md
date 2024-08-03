## 套件安裝
pip install -r requirements.txt
## 主程式執行(啟動api)
python App.py
### 失智偵測
路由: http://localhost:5000/detection
方法: POST
請求: {"user": "tony", "content": "嗨"}
回應: {"user": "tony", "detection": 1}