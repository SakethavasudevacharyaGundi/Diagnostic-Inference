from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, START, END

from reference_ranges import REFERENCE_RANGES
from llm import get_explanation
from mcp_server import reference_range_lookup

TEST_NAME_MAP = {
    "Trombosit": "Platelet",
    "İnsülin": "Insulin",
    "Lökosit": "WBC",
    "Hemoglobin": "Hemoglobin",
    "Ferritin": "Ferritin",
}

UNIT_ALIASES = {
    "mmol/L": "mmol/L",
    "mEq/L": "mmol/L",
}

class LabState(TypedDict):
    labs: List[Dict[str, Any]]

def resolve_ranges_node(state: LabState) -> LabState:
    labs = state["labs"]
    
    # Create case-insensitive lookup maps
    local_keys_lower = {k.lower(): k for k in REFERENCE_RANGES.keys()}
    map_keys_lower = {k.lower(): v for k, v in TEST_NAME_MAP.items()}
    
    for lab in labs:
        raw_name = lab.get("test_name", "")
        raw_name_lower = raw_name.lower()
        
        # 1. Check if it matches an alias (case-insensitive)
        normalized_name = map_keys_lower.get(raw_name_lower, raw_name)
        
        # 2. Re-case the name if it matches a local key (case-insensitive)
        if normalized_name.lower() in local_keys_lower:
            normalized_name = local_keys_lower[normalized_name.lower()]
            
        # We need to Title Case the name for the MCP server if it missed locally
        # to ensure things like "hemoglobin" match "Hemoglobin"
        if normalized_name.lower() not in local_keys_lower:
            # Simple heuristic: Title Case for fallback DB matching
            normalized_name = normalized_name.title()
            
        lab["test_name"] = normalized_name
        
        if normalized_name in REFERENCE_RANGES:
            lab["ref"] = REFERENCE_RANGES[normalized_name]
            lab["reference_source"] = "local"
        else:
            print(f"[MCP] Agent invoking reference_range_lookup for: {normalized_name}")
            mcp_ref = reference_range_lookup(normalized_name)
            lab["ref"] = mcp_ref if mcp_ref else None
            lab["reference_source"] = "MCP"
    return {"labs": labs}

def classify_result(value: float, ref: dict, input_unit: str) -> str:
    """
    Core classification logic.
    The 30% deviation threshold is an engineering rule used for this assignment 
    and is not intended to represent a clinical guideline.
    """
    # 1. Unknown reference check
    if not ref or "min" not in ref or "max" not in ref:
        return "Unknown"
        
    # 2. Invalid value check (physically nonsensical)
    if value <= 0:
        return "Invalid"
        
    # 3. Unit validation
    ref_unit = ref.get("unit", "")
    norm_input = UNIT_ALIASES.get(input_unit, input_unit)
    norm_ref = UNIT_ALIASES.get(ref_unit, ref_unit)
    
    if norm_input and norm_ref and norm_input != norm_ref:
        return "Invalid" # Unit mismatch
        
    min_val, max_val = ref["min"], ref["max"]
    
    # 4. Within range
    if min_val <= value <= max_val:
        return "Normal"
        
    # 5. Outside range -> calculate deviation
    if value < min_val:
        deviation = (min_val - value) / min_val
    else:
        deviation = (value - max_val) / max_val
        
    if deviation > 0.30:
        return "Critical"
    else:
        return "Warning"

def classify_node(state: LabState) -> LabState:
    labs = state["labs"]
    for lab in labs:
        ref = lab.get("ref")
        value = lab.get("value", 0.0)
        input_unit = lab.get("unit", "")
        
        lab["status"] = classify_result(value, ref, input_unit)
        
        # Normalize the unit in the output if it matched an alias
        if lab["status"] != "Invalid" and ref:
            lab["unit"] = ref.get("unit", input_unit)
            
    return {"labs": labs}

def explain_node(state: LabState) -> LabState:
    labs = state["labs"]
    for lab in labs:
        status = lab.get("status", "Unknown")
        ref = lab.get("ref")
        llm_out = get_explanation(lab, status, ref)
        lab["explanation"] = llm_out.get("explanation")
        lab["next_step"] = llm_out.get("next_step")
    return {"labs": labs}

def route_node(state: LabState) -> LabState:
    labs = state["labs"]
    priority = {"Critical": 0, "Invalid": 1, "Warning": 2, "Normal": 3, "Unknown": 4}
    sorted_labs = sorted(labs, key=lambda x: priority.get(x.get("status"), 5))
    return {"labs": sorted_labs}

# Build graph
workflow = StateGraph(LabState)
workflow.add_node("resolve_ranges", resolve_ranges_node)
workflow.add_node("classify", classify_node)
workflow.add_node("explain", explain_node)
workflow.add_node("route", route_node)

workflow.add_edge(START, "resolve_ranges")
workflow.add_edge("resolve_ranges", "classify")
workflow.add_edge("classify", "explain")
workflow.add_edge("explain", "route")
workflow.add_edge("route", END)

# Compile the graph
app = workflow.compile()

def process_labs(labs: list) -> list:
    """
    Entrypoint for FastAPI. Invokes the LangGraph workflow.
    """
    # Create the initial state
    initial_state = {"labs": labs}
    
    # Invoke the compiled LangGraph workflow
    final_state = app.invoke(initial_state)
    
    return final_state["labs"]
