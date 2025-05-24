from fastapi import FastAPI
from pydantic import BaseModel
import httpx
import json
import re

app = FastAPI()

class Request(BaseModel):
    text: str

def generate_mcq_prompt(text: str) -> str:
    return f"""
You are an expert question generator.

Generate 3 multiple-choice questions (MCQs) based on the following transcript segment:

\"\"\"{text}\"\"\"

Format your response as a JSON array like this:

[
  {{
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Correct option text"
  }},
  ...
]

Make sure the questions are relevant, clear, and the correct answer is included in the options.
"""

OLLAMA_API_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen2.5:1.5b"

@app.post("/generate-questions")
async def generate_questions(req: Request):
    prompt = generate_mcq_prompt(req.text)

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You generate MCQs based on transcript text."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 400
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(OLLAMA_API_URL, json=payload)

    if response.status_code != 200:
        return {
            "error": "Ollama API call failed",
            "status_code": response.status_code,
            "detail": response.text
        }

    lines = response.text.strip().splitlines()
    contents = []

    for line in lines:
        try:
            obj = json.loads(line)
            content = obj.get("message", {}).get("content", "")
            contents.append(content)
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse line as JSON",
                "line": line
            }

    full_content = "".join(contents)
    
    print("Full assistant response content:", full_content)

    try:
        mcqs = json.loads(full_content)
    except json.JSONDecodeError:
        match = re.search(r'\[\s*\{.*?\}\s*\]', full_content, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                mcqs = json.loads(json_str)
            except Exception as e:
                return {
                    "error": "Failed to parse extracted JSON",
                    "extracted_json": json_str,
                    "exception": str(e)
                }
        else:
            return {
                "error": "No JSON array found in assistant response",
                "full_content": full_content
            }

    return {"mcqs": mcqs}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
