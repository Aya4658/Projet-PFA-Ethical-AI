from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine import get_ethical_analysis

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: Request, body: ChatRequest):
    """Handle chat requests.

    If the request hostname is not localhost/127.0.0.1, disable CSV lookups
    (large CSV scanning) and only consult the MongoDB-backed search to keep
    responses fast for network calls.
    """
    try:
        # Force DB-only mode for all requests to avoid heavy CSV scans
        answer = get_ethical_analysis(body.message, allow_csv=False)
        return {"reply": answer}
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print("Exception in /chat endpoint:\n", tb)
        return {"reply": f"Désolé, une erreur interne est survenue: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)