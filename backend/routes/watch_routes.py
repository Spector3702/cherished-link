from flask import Blueprint, request, jsonify, current_app
import os
import base64
import requests
from datetime import datetime

from services.wander_detection.wander_detection import WanderDetection
from services.dementia_detection.dementia_detection import DementiaDetection


user_wander_detection = {}
watch_routes = Blueprint('watch_routes', __name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
EXPECTED_WANDER_TIME = 60
EXPECTED_WANDER_MAX_DISTANCE = 1610
EXPECTED_WANDER_MIN_DISTANCE = 10
EXPECTED_DISTANCE_FROM_HOME = 2400

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
            expected_time=EXPECTED_WANDER_TIME,
            expected_max_distance=EXPECTED_WANDER_MAX_DISTANCE,
            expected_min_distance=EXPECTED_WANDER_MIN_DISTANCE
        )

    wander_detector = user_wander_detection[user]
    wandering = wander_detector.detect_wandering(location)

    if wandering:
        send_notification("Wandering Alert", f"Parent is wandering in one place over {EXPECTED_WANDER_TIME} minutes!")
    
    distance_from_home = wander_detector._haversine_distance(home_location, location)
    if distance_from_home > EXPECTED_DISTANCE_FROM_HOME:
        send_notification("Location Alert", f"Parent has moved {distance_from_home:.2f} meters away from home!")

    return jsonify({"wandering": wandering})


@watch_routes.route("/watch/voice-detection", methods=["POST"])
def voice_detection():
    data = request.get_json()
    file_data = base64.b64decode(data['fileData'])
    user = request.headers.get('user')

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(UPLOAD_FOLDER, f"{user}_{timestamp}.m4a")

    with open(file_path, 'wb') as f:
        f.write(file_data)

    dementiaDetection = DementiaDetection(user)
    detection = dementiaDetection.detection(file_path)

    send_notification("Voice Received", f"Dementia detection result: {detection}")

    return jsonify({"user": user, "audio_file": file_path})


@watch_routes.route("/watch/vitalsigns", methods=["POST"])
def vitalsigns():
    requestData = request.get_json()

    formatted_vitalsigns = "Vitalsigns:\n" + "\n".join([f"  - {key}: {value}" for key, value in requestData.items()])
    send_notification("Vital Signs Info", f"{formatted_vitalsigns}")

    return jsonify({"status": "success"})