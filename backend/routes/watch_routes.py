from flask import Blueprint, request, jsonify, current_app
import os
import base64
import requests
from datetime import datetime

from services.wander_detection.wander_detection import WanderDetection
from Translators import Translators
from DementiaDetection import DementiaDetection
from Database import MongoDB

user_wander_detection = {}
translators = Translators()
dementiaDetection = DementiaDetection()
db = MongoDB(host="localhost", account="root", passwrod="1234", port=27017)

watch_routes = Blueprint('watch_routes', __name__)
EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def send_notification(title, message):
    expo_push_token = current_app.config['EXPO_PUSH_TOKEN']
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


@watch_routes.route("/watch/set_match_number", methods=['POST'])
def set_match_number():
    requestData = request.get_json()
    match_number = requestData.get("match_number")

    current_app.config['MATCH_NUMBER'] = match_number

    return jsonify({"status": "success", "match_number": match_number})


@watch_routes.route("/watch/get_match_status", methods=['GET'])
def get_match_status():
    match_status = current_app.config['MATCH_STATUS']
    return jsonify({"match_status": match_status})


@watch_routes.route("/watch/gps", methods=["POST"])
def gps():
    requestData = request.get_json()

    user = requestData.get("user")
    location = requestData.get("location")
    home_location = current_app.config['HOME_LOCATION']

    if user not in user_wander_detection:
        user_wander_detection[user] = WanderDetection(
            user_id=user, 
            initial_location=location,
            expected_time=1,
            expected_distance=50
        )

    wander_detector = user_wander_detection[user]
    wandering = wander_detector.detect_wandering(location)

    if wandering:
        send_notification("Wandering Alert", "Parent is wandering in one place over 10 minutes!")
    
    distance_from_home = wander_detector._haversine_distance(home_location, location)
    if distance_from_home > 50:
        send_notification("Location Alert", f"Parent has moved {distance_from_home:.2f} meters away from home!")

    return jsonify({"wandering": wandering})


@watch_routes.route("/watch/voice-detection", methods=["POST"])
def voice_detection():
    data = request.get_json()
    file_data = base64.b64decode(data['fileData'])
    user = request.headers.get('user')

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

    send_notification("Voice Received", "Recorded voice from watch succeeded")

    return jsonify({"user": user, "audio_file": 'uploaded_audio.m4a'})
