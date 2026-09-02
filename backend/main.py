from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from agent import process_labs

app = FastAPI(title="Clinical Lab Results Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LabInput(BaseModel):
    test_name: str
    value: float
    unit: str

class AnalyzeLabsRequest(BaseModel):
    labs: List[LabInput]

@app.post("/analyze_labs")
async def analyze_labs(request: AnalyzeLabsRequest):
    # Convert Pydantic models to dicts for the LangGraph state
    labs_dict = [lab.model_dump() for lab in request.labs]
    
    # Process through the LangGraph workflow
    results = process_labs(labs_dict)
    
    return {"results": results}

@app.get("/")
def health_check():
    return {"status": "healthy"}
