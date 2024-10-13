# Cherished-Link 行為為基礎的早期失智症監測機器學習偵測模型
全球逐漸走入高齡化世界，失智症也隨年齡增加呈現倍增之趨勢。而在診斷失智症的一系列檢查過程對於家屬及長輩來說都相當繁雜，有些家屬甚至是病患本身在早期可能會因此忽視掉症狀從而延誤就醫，這樣就會因而提高後續病狀發作的風險。本研究主要目的為探討以早期辨識失智症並通知使用者與家屬，達到預警以及早醫之目的。本研究使用網路公開中文語音資料庫，研究方法主要分為資料前處理、基礎機器學習與位置資料處理。透過將原始被陪伴者的語音形式資料轉為文字，依早期失智症行為特徵的分類諸如外出行為、社交行為、室內行為、邏輯語意等等進行特徵的萃取，再以機器學習演算法模型建立失智預警模型，根據定位資料進行特定位置樣本比對與漫遊迷路辨識，最後建立一失智辨識系統，以提供予家屬與家中陪伴者使用。


## Setup

### Python
* 套件安裝（建議用虛擬環境）
    ```shell
    pip install -r /backend/requirements.txt
    ```

### MongoDB
* [Mac brew install](https://www.mongodb.com/zh-cn/docs/manual/tutorial/install-mongodb-on-os-x/)
* start: `brew services start mongodb-community@7.0`
* view: use [Compass](https://www.mongodb.com/products/tools/compass)
* stop: `brew services stop mongodb-community@7.0`

### Expo
* download & install [Android Studio](https://developer.android.com/studio?hl=zh-tw)
    * click "Virtual Device Manager"
    * device: Pixel 8 API 35
    * run device
* install Expo: 
    ```
    npx create-expo-app@latest
    npx expo install expo-notifications expo-location
    ```
* install eas:
    ```shell
    npm install -g eas-cli
    eas init
    ```
* login: `npx expo login`

## Quick Start

### Python Backend
* `cd backend`
* `python App.py`
* 畫面顯示類似這樣:
    ```sh
    * Running on all addresses (0.0.0.0)
    * Running on http://127.0.0.1:5000
    * Running on http://192.168.4.114:5000
    ```

### Run watch
* 再開一個新的終端機
* `cd watch`
* `export EXPO_PUBLIC_BACKEND_URL={URL}/watch` 
    * URL 要用上面後端顯示的「第三行」, ex: `export EXPO_PUBLIC_BACKEND_URL=http://192.168.4.114:5000/watch`
    * Windows 要換成 `$Env:EXPO_PUBLIC_BACKEND_URL = "http://192.168.4.114:5000/watch"`
* `npx expo start`
* press `shift+a`
* select watch

### Run phone
* 開一個新的終端機
* `cd phone`
* `export EXPO_PUBLIC_BACKEND_URL={URL}/phone` 
    * URL 要用上面後端顯示的「第三行」, ex: `export EXPO_PUBLIC_BACKEND_URL=http://192.168.4.114:5000/phone`
    * Windows 要換成 `$Env:EXPO_PUBLIC_BACKEND_URL = "http://192.168.4.114:5000/phone"`
* `npx expo start`
* press `shift+a`
* select emulator
