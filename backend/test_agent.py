from agent import process_labs
import json
import sys
import codecs
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach()) if hasattr(sys.stdout, 'detach') else sys.stdout

def test_final_demo_cases():
    print("="*70)
    print("FINAL DEMO 10-TEST SUITE: Covering entire pipeline and edge cases")
    print("="*70)
    
    labs = [
        # 1. Normal local: Hemoglobin = 14 g/dL -> Normal
        {"test_name": "Hemoglobin", "value": 14.0, "unit": "g/dL"},
        
        # 2. Warning low: Hemoglobin = 11 g/dL -> Warning (deviation < 30%)
        {"test_name": "Hemoglobin", "value": 11.0, "unit": "g/dL"},
        
        # 3. Critical low: Hemoglobin = 5 g/dL -> Critical (deviation > 30%)
        {"test_name": "Hemoglobin", "value": 5.0, "unit": "g/dL"},
        
        # 4. Warning high: Trombosit = 500 10^3/uL -> Warning (deviation < 30%)
        {"test_name": "Trombosit", "value": 500.0, "unit": "10^3/uL"},
        
        # 5. Critical low: Trombosit = 50 10^3/uL -> Critical (deviation > 30%)
        {"test_name": "Trombosit", "value": 50.0, "unit": "10^3/uL"},
        
        # 6. Normal MCP: Potassium = 4.5 mmol/L -> MCP -> Normal
        {"test_name": "Potassium", "value": 4.5, "unit": "mmol/L"},
        
        # 7. Abnormal MCP: Potassium = 2.0 mmol/L -> MCP -> Critical (> 30% dev from 3.5)
        {"test_name": "Potassium", "value": 2.0, "unit": "mmol/L"},
        
        # 8. Unknown test: No reference range -> Unknown (NO LLM CLINICAL INTERPRETATION)
        {"test_name": "UnknownTestName", "value": 100.0, "unit": "unknown"},
        
        # 9. Invalid value: Negative value -> Invalid (NO LLM CLINICAL INTERPRETATION)
        {"test_name": "Hemoglobin", "value": -500.0, "unit": "g/dL"},
        
        # 10. Boundary value: Exact lower reference boundary -> Normal
        {"test_name": "Hemoglobin", "value": 12.0, "unit": "g/dL"}
    ]

    print(f"Sending {len(labs)} tests to the pipeline...\n")
    results = process_labs(labs)
    
    # We dump it with ensure_ascii=False to beautifully format unicode characters
    # because we explicitly forced sys.stdout to utf-8 above.
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    test_final_demo_cases()
