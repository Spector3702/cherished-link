import logging
from datetime import datetime, timedelta
from math import radians, cos, sin, sqrt, atan2

from services.mongo_db import MongoDB


class WanderDetection:
    def __init__(self, user_id, initial_location, expected_time, expected_max_distance, expected_min_distance):
        self.user_id = user_id
        self.initial_location = initial_location
        self.initial_time = datetime.now()
        self.expected_time = expected_time
        self.expected_max_distance = expected_max_distance
        self.expected_min_distance = expected_min_distance
        self.db = MongoDB(host="localhost", port=27017, db='cherished-link')

    def _haversine_distance(self, loc1, loc2):
        # Convert latitude and longitude from degrees to radians
        lat1, lon1 = radians(loc1['latitude']), radians(loc1['longitude'])
        lat2, lon2 = radians(loc2['latitude']), radians(loc2['longitude'])

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        # Radius of Earth in meters (mean radius)
        R = 6371000
        distance = R * c  # Distance in meters
        return distance

    def _update_location(self, new_location):
        # Check if new location is within expected range of the initial location
        distance = self._haversine_distance(self.initial_location, new_location)
        logging.info(f"Distance from initial location: {distance:.2f} meters")

        if distance > self.expected_max_distance or distance < self.expected_min_distance:
            return None  # User moved outside the expected range

        return distance  # Still within radius and within time frame
    
    def _save_db(self, is_wander, distance):
        result = {
            "user": self.user_id,
            "initialLocation": self.initial_location,
            "initialTime": self.initial_time,
            "expectedTime": self.expected_time,
            "expectedMaxDistance": self.expected_max_distance,
            "expectedMinDistance": self.expected_min_distance,
            "distance": distance,
            "isWander": is_wander,
            "createTime": str(datetime.now())
        }
        self.db.save('WanderDetection', result)

    def detect_wandering(self, new_location):
        distance = self._update_location(new_location)
        if distance is not None:
            # If the user is still within radius, detect wandering
            time_now = datetime.now()
            if time_now - self.initial_time >= timedelta(minutes=self.expected_time):
                self._save_db(True, distance)
                return True  # Wander detected
            
        return False  # No wander detected yet
