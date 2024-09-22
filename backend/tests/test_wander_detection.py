import pytest
from unittest.mock import patch
from services.wander_detection.wander_detection import WanderDetection

# Mock MongoDB save method
@pytest.fixture
def mock_mongo_db():
    with patch('services.wander_detection.wander_detection.MongoDB') as mock_mongo:
        yield mock_mongo

def test_detect_wandering_within_radius(mock_mongo_db):
    initial_location = {'latitude': 37.7749, 'longitude': -122.4194}
    
    # Create WanderDetection instance
    wander = WanderDetection(
        user_id="user123", 
        initial_location=initial_location, 
        expected_time=5,  # 5 minutes
        expected_distance=50  # 50 meters
    )
    
    # Simulate a new location within 50 meters
    new_location = {'latitude': 37.7750, 'longitude': -122.4195}
    
    # Call detect_wandering before expected time is up
    result = wander.detect_wandering(new_location)
    
    # Assert that no wandering is detected (False)
    assert result == False

    # Ensure MongoDB save was not called
    mock_mongo_db.return_value.save.assert_not_called()

def test_detect_wandering_outside_radius(mock_mongo_db):
    # Initial user location
    initial_location = {'latitude': 37.7749, 'longitude': -122.4194}
    
    # Create WanderDetection instance
    wander = WanderDetection(
        user_id="user123", 
        initial_location=initial_location, 
        expected_time=5,  # 5 minutes
        expected_distance=50  # 50 meters
    )
    
    # Simulate a new location outside 50 meters
    new_location = {'latitude': 37.7760, 'longitude': -122.4200}
    
    # Call detect_wandering
    result = wander.detect_wandering(new_location)
    
    # Assert that no wandering is detected (False)
    assert result == False
    
    # Ensure MongoDB save was not called since user moved outside expected range
    mock_mongo_db.return_value.save.assert_not_called()

def test_detect_wandering_after_expected_time(mock_mongo_db):
    # Initial user location
    initial_location = {'latitude': 37.7749, 'longitude': -122.4194}
    
    # Create WanderDetection instance
    wander = WanderDetection(
        user_id="user123", 
        initial_location=initial_location, 
        expected_time=0,  # Expect immediate wander detection
        expected_distance=50  # 50 meters
    )
    
    # Simulate a new location within the radius
    new_location = {'latitude': 37.7749, 'longitude': -122.4194}
    
    # Call detect_wandering after expected time has passed
    result = wander.detect_wandering(new_location)
    
    # Assert that wandering is detected (True)
    assert result == True
    
    # Ensure MongoDB save was called
    mock_mongo_db.return_value.save.assert_called_once()
