# Minimal MCP server exposing reference_range_lookup

def reference_range_lookup(test_name: str) -> dict:
    """
    MCP tool to provide a fallback lookup for unknown tests.
    """
    fallback_db = {
        "Platelet": {
            "min": 150.0, "max": 450.0, "unit": "10^3/uL",
            "unit_description": "Bin/µL",
            "recommended_followup": "Rutin kontrol"
        },
        "WBC": {
            "min": 5.0, "max": 10.6, "unit": "10^3/uL",
            "unit_description": "Bin/µL",
            "recommended_followup": "Rutin kontrol"
        },
        "Hemoglobin": {
            "min": 12.0, "max": 15.0, "unit": "g/dL",
            "unit_description": "Gram/Desilitre",
            "recommended_followup": "Rutin kontrol"
        }
    }
    
    # Case-insensitive lookup
    for k, v in fallback_db.items():
        if k.lower() == test_name.lower():
            return v
            
    return {}
