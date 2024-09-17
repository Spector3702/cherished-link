import os
import requests
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

from Translators import Translators
from DementiaDetection import DementiaDetection
from Database import MongoDB


app = Flask(__name__)
CORS(app)
translators = Translators()
dementiaDetection = DementiaDetection()
db = MongoDB(host="localhost", account="root", passwrod="1234", port=27017)

UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
expo_push_token = None


def send_notification(title, message):
    global expo_push_token
    if not expo_push_token:
        print("Expo push token is not set.")
        return

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    data = {
        "to": expo_push_token,
        "sound": "default",
        "title": title,
        "body": message,
        "data": {"time": str(datetime.now())}
    }
    response = requests.post(EXPO_PUSH_URL, headers=headers, json=data)
    if response.status_code == 200:
        print(f"Notification sent successfully: {response.json()}")
    else:
        print(f"Failed to send notification: {response.content}")


@app.route("/expo-token", methods=["POST"])
def expo_token():
    """
    Endpoint to receive and store Expo Push Token.
    """
    global expo_push_token

    try:
        data = request.get_json()
        expo_push_token = data.get("expoPushToken")
        user = data.get("user")

        if not expo_push_token:
            return jsonify({"error": "Expo Push Token is required"}), 400

        return jsonify({"message": f"Token received: {expo_push_token}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/gps", methods=["POST"])
def gps():
    requestData = request.get_json()

    user = requestData.get("user")
    location = requestData.get("location")
    
    notification_data = {
        "user": user,
        "type": "GPS Alert",
        "location": location,
        "message": "You are too far from home!",
        "createTime": str(datetime.now())
    }
    send_notification("GPS Alert", "You are too far from home!")

    return jsonify({"status": "success", "data": notification_data})


@app.route("/blood-pressure", methods=["POST"])
def blood_pressure():
    requestData = request.get_json()

    user = requestData.get("user")
    systolic = requestData.get("systolic")
    diastolic = requestData.get("diastolic")

    notification_data = {"user": user, "type": "Blood Pressure", "systolic": systolic, "diastolic": diastolic, "createTime": str(datetime.now())}
    send_notification(notification_data)

    return jsonify({"status": "success", "data": notification_data})


@app.route("/voice-detection", methods=["POST"])
def voice_detection():
    data = request.get_json()
    file_data = base64.b64decode(data['fileData'])
    user = request.headers.get('user')

    # Save the uploaded file locally
    file_path = os.path.join(UPLOAD_FOLDER, 'uploaded_audio.m4a')
    with open(file_path, 'wb') as f:
        f.write(file_data)

    # translationContent = translators.chineseToEnglish(content)
    # detection = dementiaDetection.detection(translationContent)
    # result = {
    #     "user": user,
    #     "content": content,
    #     "translationContent": translationContent,
    #     "detection": detection,
    #     "createTime": str(datetime.now())
    # }
    # db.save(result)
 
    # notification_data = {"user": user, "type": "Voice Detection", "detection": detection, "createTime": str(datetime.now())}
    # send_notification(notification_data)

    return jsonify({"user": user, "audio_file": 'uploaded_audio.m4a'})


if __name__ == '__main__':
    app.run("0.0.0.0")
