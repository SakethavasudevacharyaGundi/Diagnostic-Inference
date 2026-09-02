from .reference_ranges import REFERENCE_RANGES
from .llm import get_explanation

def classify(test_name: str, value: float, unit: str) -> str:
    # TODO: Compare value to reference range
    return "Normal"

def route(results: list) -> list:
    # TODO: Sort Critical -> Warning -> Normal
    return results

def process_labs(labs: list) -> list:
    # TODO: Tie classify -> route -> explain
    return []
