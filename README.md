# Cherished-Link
隨著人口高齡化趨勢，越來越多年長者獨居與孤獨問題，又或是若有失智的年長者在家中，但失智的量測因家屬不在身旁，不易被即時察覺。本研究目的主要針對這些問題來開發一款針對年長者的APP，建立親屬形象數位助理，有效減少長輩孤獨感，同時關注失智症狀的發生與評估嚴重程度。該APP有多項功能，分別有：(1)親屬形象化助理互動、(2)食藥監督機能、(3)藉由語音辨識來偵測失智程度、(4)日誌上傳與碎片回顧。

## Python Backend

### Quick Start
* 套件安裝
    ```shell
    pip install -r requirements.txt
    ```
* 主程式執行
    ```shell
    python App.py
    ```
* api (失智偵測)
    - 路由: http://localhost:5000/detection
    - 方法: POST
    - 請求: {"user": "tony", "content": "嗨"}
    - 回應: {"user": "tony", "detection": 1}


## Android App

### Quick Start
* Setup
    * download & install [Android Studio](https://developer.android.com/studio?hl=zh-tw)
        * click "Virtual Device Manager"
        * device: Pixel 8 API 35
        * run device
    * install Expo: 
        ```
        npx create-expo-app@latest
        npx expo install expo-notifications
        ```
    * install eas:
        ```shell
        npm install -g eas-cli
        eas init
        ```
    * login: `npx expo login`