import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

# client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def get_explanation(lab: dict, status: str, ref: dict) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        return "AI explanation temporarily unavailable (API key missing)"
        
    try:
        client = anthropic.Anthropic(api_key=api_key)
        ref_text = f"{ref['min']}-{ref['max']} {ref['unit']}" if ref else "Unknown"
        
        prompt = f"""
You are a clinical lab AI assistant. Briefly explain the following lab result to a patient.
Test: {lab.get('test_name')}
Value: {lab.get('value')} {lab.get('unit')}
Status: {status}
Reference Range: {ref_text}

Provide a concise, 1-2 sentence explanation of what this means. If the status is Normal, reassure them. 
Do not prescribe medication.
"""
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=150,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        print(f"LLM error: {e}")
        return "AI explanation temporarily unavailable"
