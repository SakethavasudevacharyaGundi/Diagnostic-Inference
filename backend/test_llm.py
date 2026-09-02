import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

def test_anthropic_call():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        print("ERROR: ANTHROPIC_API_KEY is not set in .env")
        return

    client = anthropic.Anthropic(api_key=api_key)
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Hello, this is a test. Reply with 'LLM connection successful'."}
            ]
        )
        print("Success! LLM Response:")
        print(response.content[0].text)
    except Exception as e:
        print(f"LLM Call Failed: {e}")

if __name__ == "__main__":
    test_anthropic_call()
