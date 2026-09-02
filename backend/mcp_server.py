# Minimal MCP server exposing reference_range_lookup

def reference_range_lookup(test_name: str) -> dict:
    """
    MCP tool to provide a fallback lookup for unknown tests.
    """
    fallback_db = {
        "Potassium": {"min": 3.5, "max": 5.0, "unit": "mEq/L"},
        "Sodium": {"min": 135.0, "max": 145.0, "unit": "mEq/L"},
        "Calcium": {"min": 8.5, "max": 10.2, "unit": "mg/dL"}
    }
    return fallback_db.get(test_name, {})
