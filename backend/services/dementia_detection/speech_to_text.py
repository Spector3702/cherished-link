import assemblyai as aai

aai.settings.api_key = "53bdbc097f794bf58e72af39cd84862c"
config = aai.TranscriptionConfig(language_code="zh")
transcriber = aai.Transcriber(config=config)

transcript = transcriber.transcribe("/Users/shikaiyi/Desktop/git_repo/cherished-link/backend/uploads/uploaded_audio.m4a")

print(transcript.text)