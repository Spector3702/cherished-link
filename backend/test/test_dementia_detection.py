import pytest
from unittest.mock import patch, MagicMock
from services.dementia_detection.dementia_detection import DementiaDetection


@pytest.fixture
def mock_mongo_db():
    with patch('services.dementia_detection.dementia_detection.MongoDB') as mock_mongo:
        yield mock_mongo

@pytest.fixture
def mock_speech_to_text():
    with patch.object(DementiaDetection, '_speech2text', return_value="这是中文测试") as mock_speech:
        yield mock_speech

@pytest.fixture
def mock_tokenizer_and_model():
    with patch('services.dementia_detection.dementia_detection.AutoTokenizer') as mock_tokenizer, \
         patch('services.dementia_detection.dementia_detection.XLMRobertaForSequenceClassification') as mock_model:
        
        # Mock tokenizer return value
        mock_tokenizer.from_pretrained.return_value = MagicMock(
            return_tensors="pt", __call__=lambda x: {"input_ids": [[0]]}
        )

        # Mock model's logits and prediction
        mock_model.from_pretrained.return_value = MagicMock(
            logits=MagicMock(
                argmax=MagicMock(return_value=MagicMock(item=lambda: 1))
            )
        )
        
        yield mock_tokenizer, mock_model


def test_dementia_detection(mock_mongo_db, mock_speech_to_text, mock_tokenizer_and_model):
    # Initialize DementiaDetection instance
    dementia_detection = DementiaDetection(user="test_user")
    
    # Call detection method with a mock file path
    result = dementia_detection.detection(file_path="mock_file_path.m4a")

    # Verify that MongoDB's save method was called with the correct arguments
    mock_mongo_db.return_value.save.assert_called_once()
    
    saved_data = mock_mongo_db.return_value.save.call_args[0][1]
    assert saved_data['user'] == "test_user"
    assert saved_data['content'] == "这是中文测试"
