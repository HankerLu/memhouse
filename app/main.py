from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import os

app = FastAPI()

@app.get("/api/animation")
async def get_animation():
    file_path = "static/animation.webp"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Animation file not found")
    else:
        print("Animation file found")
    return FileResponse(file_path) 