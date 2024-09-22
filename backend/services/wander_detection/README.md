# WanderDetection Class

The `WanderDetection` class is used to track the movement of a user and determine if they are wandering within a specific area (50 meters) over a given time period (10 minutes). This can be useful for detecting if a person is staying in the same location for too long, which might indicate wandering behavior.

## How It Works

### Initialization
When an instance of the `WanderDetection` class is created, it stores:
- The **user's ID** (`user_id`).
- The **initial location** (`initial_location`), which is a dictionary containing latitude and longitude.
- The **time** when the first location update was received (`initial_time`).

### Methods

#### `_haversine_distance(self, loc1, loc2)`
This is a helper method that calculates the **great-circle distance** between two points on the Earth's surface using their latitude and longitude. It uses the **Haversine formula** to compute the distance between the two locations in meters.

##### Haversine Formula Explained:
The Haversine formula gives the shortest distance between two points on a sphere's surface, which in this case represents the Earth.

The formula used is:

![Haversine Formula](https://latex.codecogs.com/svg.latex?\d=2R\arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\varphi}{2}\right)+\cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right))


Where:
- `d` is the distance between the two points (in meters).
- `R` is the Earth's radius (approximately 6,371,000 meters).
- `φ1` and `φ2` are the latitudes of the two points (in radians).
- `λ1` and `λ2` are the longitudes of the two points (in radians).
- `Δφ = φ2 - φ1` is the difference in latitudes.
- `Δλ = λ2 - λ1` is the difference in longitudes.

This formula computes the central angle between two points on a sphere, and by multiplying it by the Earth's radius `R`, we get the actual distance in meters.

#### `update_location(self, new_location)`
This method compares the current location of the user (`new_location`) with the initial location. It checks whether the user has moved outside a 50-meter radius from the starting point using the `_haversine_distance` method.

If the user has moved more than 50 meters, it returns `False`. If the user is still within the radius, it returns `True`.

#### `detect_wandering(self, new_location)`
This method is the main logic for detecting if the user is wandering. It checks if:
- The user is still within the 50-meter radius (using `update_location`).
- More than 10 minutes have passed since the initial location update.

If both conditions are met, the method returns `True`, indicating the user is "wandering." Otherwise, it returns `False`.

## Example Usage

```python
from datetime import datetime

# Example initial location
initial_location = {
    "latitude": 40.730610,   # New York City
    "longitude": -73.935242
}

# New location to check
new_location = {
    "latitude": 40.730700,
    "longitude": -73.935300
}

# Create a WanderDetection instance for the user
wander_detector = WanderDetection(user_id=123, initial_location=initial_location)

# Simulate the user sending updated GPS locations
wandering = wander_detector.detect_wandering(new_location)

if wandering:
    print("User is wandering within the same area for over 10 minutes.")
else:
    print("No wandering detected.")
