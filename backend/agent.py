from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, START, END

from .reference_ranges import REFERENCE_RANGES
from .llm import get_explanation
from .mcp_server import reference_range_lookup

class LabState(TypedDict):
    labs: List[Dict[str, Any]]

def resolve_ranges_node(state: LabState) -> LabState:
    labs = state["labs"]
    for lab in labs:
        test_name = lab.get("test_name", "")
        if test_name in REFERENCE_RANGES:
            lab["ref"] = REFERENCE_RANGES[test_name]
        else:
            # Required by Hour 4: Add a visible print statement when Agent calls MCP tool
            print(f"[MCP] Agent invoking reference_range_lookup for: {test_name}")
            lab["ref"] = reference_range_lookup(test_name)
    return {"labs": labs}

def classify_node(state: LabState) -> LabState:
    labs = state["labs"]
    for lab in labs:
        ref = lab.get("ref")
        value = lab.get("value", 0.0)
        
        if not ref or "min" not in ref or "max" not in ref:
            lab["status"] = "Unknown"
            continue
            
        min_val, max_val = ref["min"], ref["max"]
            
        if min_val <= value <= max_val:
            lab["status"] = "Normal"
        else:
            # 30% deviation rule
            if value < min_val:
                deviation = (min_val - value) / min_val
            else:
                deviation = (value - max_val) / max_val
                
            if deviation > 0.30:
                lab["status"] = "Critical"
            else:
                lab["status"] = "Warning"
    return {"labs": labs}

def explain_node(state: LabState) -> LabState:
    labs = state["labs"]
    for lab in labs:
        status = lab.get("status", "Unknown")
        ref = lab.get("ref")
        lab["explanation"] = get_explanation(lab, status, ref)
    return {"labs": labs}

def route_node(state: LabState) -> LabState:
    labs = state["labs"]
    priority = {"Critical": 0, "Warning": 1, "Normal": 2, "Unknown": 3}
    sorted_labs = sorted(labs, key=lambda x: priority.get(x.get("status"), 4))
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
