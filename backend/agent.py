from .reference_ranges import REFERENCE_RANGES
from .llm import get_explanation

def classify(test_name: str, value: float, unit: str) -> str:
    if test_name not in REFERENCE_RANGES:
        return "Unknown"
    
    ref = REFERENCE_RANGES[test_name]
    min_val, max_val = ref["min"], ref["max"]
    
    if min_val <= value <= max_val:
        return "Normal"
    
    # Calculate how far off the value is (as a percentage of the reference range width, or of the limit)
    # The requirement: ">30% outside range". We'll define this as >30% of the bound it exceeds.
    if value < min_val:
        deviation = (min_val - value) / min_val
    else:
        deviation = (value - max_val) / max_val
        
    if deviation > 0.30:
        return "Critical"
    else:
        return "Warning"

def route(results: list) -> list:
    # Sort order: Critical, Warning, Normal, Unknown
    priority = {"Critical": 0, "Warning": 1, "Normal": 2, "Unknown": 3}
    return sorted(results, key=lambda x: priority.get(x["status"], 4))

def process_labs(labs: list) -> list:
    results = []
    for lab in labs:
        test_name = lab.get("test_name", "")
        value = lab.get("value", 0.0)
        unit = lab.get("unit", "")
        
        status = classify(test_name, value, unit)
        ref = REFERENCE_RANGES.get(test_name, None)
        
        # Get LLM explanation
        explanation = get_explanation(lab, status, ref)
        
        results.append({
            "test_name": test_name,
            "value": value,
            "unit": unit,
            "status": status,
            "explanation": explanation
        })
        
    return route(results)
