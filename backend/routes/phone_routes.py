from flask import Blueprint, request, jsonify, current_app


phone_routes = Blueprint('phone_routes', __name__)

@phone_routes.route("/phone/expo-token", methods=["POST"])
def expo_token():

    try:
        data = request.get_json()
        expo_push_token = data.get("expoPushToken")
        if not expo_push_token:
            return jsonify({"error": "Expo Push Token is required"}), 400
        
        current_app.config['EXPO_PUSH_TOKEN'] = expo_push_token

        return jsonify({"message": f"Token received: {expo_push_token}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@phone_routes.route("/phone/get_match_number", methods=['GET'])
def get_match_number():
    match_number = current_app.config['MATCH_NUMBER']
    return jsonify({"match_number": match_number})


@phone_routes.route("/phone/set_match_status", methods=['POST'])
def set_match_status():
    requestData = request.get_json()
    match_status = requestData.get("match_status")

    current_app.config['MATCH_STATUS'] = match_status
    return jsonify({"status": "success", "match_status": match_status})


@phone_routes.route("/phone/set_home_location", methods=['POST'])
def set_home_location():
    requestData = request.get_json()
    home_location = requestData.get("home_location")

    current_app.config['HOME_LOCATION'] = home_location
    return jsonify({"status": "success", "home_location": home_location})