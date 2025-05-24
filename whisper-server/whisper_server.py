from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from typing import List
import whisper
import uvicorn
import os
import uuid

app = FastAPI()
model = whisper.load_model("base")

class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str

class TranscriptResponse(BaseModel):
    transcript: str
    segments: List[TranscriptSegment]

@app.post("/transcribe", response_model=TranscriptResponse)
async def transcribe(file: UploadFile = File(...)):
    # Generate a unique temp filename
    temp_filename = f"temp_{uuid.uuid4()}.mp4"
    with open(temp_filename, "wb") as f:
        f.write(await file.read())

    # Run Whisper transcription with timestamps
    result = model.transcribe(temp_filename, verbose=False, without_timestamps=False)

    os.remove(temp_filename)

    # Segment the transcript into ~5-minute chunks based on start times
    five_min_chunks = []
    current_chunk = {
        "start": None,
        "end": None,
        "text": ""
    }

    for segment in result["segments"]:
        seg_start = segment["start"]
        seg_end = segment["end"]
        seg_text = segment["text"].strip()

        # Start new chunk
        if current_chunk["start"] is None:
            current_chunk["start"] = seg_start

        # If current chunk is >= 300s, finalize it
        if seg_end - current_chunk["start"] >= 300:
            current_chunk["end"] = seg_end
            five_min_chunks.append({
                "start": current_chunk["start"],
                "end": current_chunk["end"],
                "text": current_chunk["text"].strip()
            })
            # Reset chunk
            current_chunk = {
                "start": seg_start,
                "end": None,
                "text": seg_text
            }
        else:
            current_chunk["text"] += " " + seg_text
            current_chunk["end"] = seg_end

    # Append final chunk if any
    if current_chunk["text"].strip():
        five_min_chunks.append({
            "start": current_chunk["start"],
            "end": current_chunk["end"],
            "text": current_chunk["text"].strip()
        })

    return {
        "transcript": result["text"],
        "segments": five_min_chunks
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
