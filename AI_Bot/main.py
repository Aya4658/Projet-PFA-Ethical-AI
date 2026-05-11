from fastapi import FastAPI
from pydantic import BaseModel
from engine import get_ethical_analysis

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    answer = get_ethical_analysis(request.message)
    return {"reply": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)