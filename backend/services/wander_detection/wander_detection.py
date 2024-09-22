from datetime import datetime, timedelta
from math import radians, cos, sin, sqrt, atan2


class WanderDetection:
    def __init__(self, user_id, initial_location):
        self.user_id = user_id
        self.initial_location = initial_location
        self.initial_time = datetime.now()

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

    def update_location(self, new_location):
        # Check if new location is within 50 meters of the initial location
        distance = self._haversine_distance(self.initial_location, new_location)
        if distance > 50:
            return False  # User moved outside the 50-meter radius

        return True  # Still within radius and within time frame

    def detect_wandering(self, new_location):
        if self.update_location(new_location):
            # If the user is still within radius, detect wandering
            time_now = datetime.now()
            if time_now - self.initial_time >= timedelta(minutes=1):
                return True  # Wander detected
            
        return False  # No wander detected yet
