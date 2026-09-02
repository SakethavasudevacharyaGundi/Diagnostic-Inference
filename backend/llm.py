import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

# client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def get_explanation(lab: dict, status: str, ref: dict) -> str:
    # TODO: Call LLM
    return "AI explanation placeholder"
