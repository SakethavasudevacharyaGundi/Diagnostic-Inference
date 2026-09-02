from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Clinical Lab Results Analyzer")

class LabInput(BaseModel):
    test_name: str
    value: float
    unit: str

class AnalyzeLabsRequest(BaseModel):
    labs: List[LabInput]

@app.post("/analyze_labs")
async def analyze_labs(request: AnalyzeLabsRequest):
    # TODO: Connect to Agent
    return {"results": []}

@app.get("/")
def health_check():
    return {"status": "healthy"}
