from backend.agent import process_labs
import json

def test_agent_core():
    # Sample labs mixing Normal, Warning, Critical, and Unknown
    labs = [
        # Normal (within 12.0 - 15.0)
        {"test_name": "Hemoglobin", "value": 14.0, "unit": "g/dL"},
        
        # Warning (slightly above max of 150) -> < 30% deviation
        {"test_name": "Ferritin", "value": 160.0, "unit": "ug/L"},
        
        # Critical (way below min of 150) -> > 30% deviation
        {"test_name": "Trombosit", "value": 50.0, "unit": "10^3/uL"},
        
        # Unknown test (not in our REFERENCE_RANGES yet)
        {"test_name": "Potassium", "value": 4.5, "unit": "mEq/L"}
    ]
    
    print("Sending labs to process_labs()...\n")
    results = process_labs(labs)
    
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    test_agent_core()
