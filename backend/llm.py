import json
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

DOMAIN_HINTS = {
    "Hemoglobin": "Relates to oxygen-carrying capacity and red blood cell status.",
    "Platelet": "Relates to blood clotting and bleeding risk.",
    "Potassium": "An electrolyte important for muscle and cardiac function.",
    "Ferritin": "Reflects stored iron and is relevant to iron status.",
    "WBC": "Relates to immune and inflammatory assessment."
}

def get_explanation(lab: dict, status: str, ref: dict) -> dict:
    # Deterministic bypass for Invalid and Unknown - no clinical interpretation needed
    if status == "Invalid":
        return {
            "explanation": "The supplied value is not a valid clinical measurement for this test.",
            "next_step": "Verify the entered value and unit before analysis."
        }
    if status == "Unknown":
        return {
            "explanation": "No reference range is available for this test, so the result cannot be clinically classified.",
            "next_step": "Verify the test name and provide an appropriate reference range."
        }

    try:
        llm = OllamaLLM(model="qwen2.5:7b", format="json") 
        
        ref_text = f"{ref['min']}-{ref['max']} {ref['unit']}" if ref else "None"
        unit_desc = ref.get("unit_description") if ref else None
        rec_followup = ref.get("recommended_followup") if ref else None

        test_name = lab.get("test_name", "")
        domain_hint = DOMAIN_HINTS.get(test_name, "Laboratory test result.")
        
        domain_context = f"{domain_hint}"
        if unit_desc:
            domain_context += f"\nUnit Description: {unit_desc}"
        if rec_followup:
            domain_context += f"\nBackground Recommended Follow-up: {rec_followup}"

        prompt_template = PromptTemplate(
            input_variables=["test_name", "value", "unit", "status", "ref_text", "domain_context"],
            template="""ROLE

You are a clinical laboratory result explanation assistant.

INPUT

Test: {test_name}
Value: {value} {unit}
Reference range: {ref_text}
Deterministic classification: {status}

DOMAIN CONTEXT

{domain_context}

RULES

1. The backend has already determined the classification.
2. Do not change the classification.
3. Reference the actual value and supplied range.
4. Do not invent reference ranges.
5. Do not invent symptoms or medical history.
6. Do not make a definitive diagnosis.
7. Do not prescribe medications or dosages.
8. You may suggest appropriate follow-up tests, referrals, monitoring, or clinical evaluation.
9. Make next steps specific when appropriate.
10. For Normal, explain that the result is within range.
11. For Warning/Critical, explain the significance of the deviation.
12. Never suggest simply 'repeating the test' as the next step, for any severity level. Always suggest a concrete, test-specific clinical action — e.g., a referral, a specific follow-up test, a monitoring recommendation, or a specialist consult — appropriate to the test and its severity.
13. Generate the next_step and explanation independently; do not just restate the background recommended follow-up verbatim.
14. Return only valid JSON.

FEW-SHOT EXAMPLE

Input:
Test: Platelet
Value: 45 x10^3/uL
Reference range: 150-450 x10^3/uL
Status: Critical

Output:
{{
  "explanation": "The platelet count of 45.0 x10^3/uL is substantially below the supplied reference range of 150-450 x10^3/uL. Such a low platelet count can be associated with increased bleeding risk.",
  "next_step": "Perform a peripheral blood smear to evaluate platelet morphology and arrange for an urgent hematology consult to investigate the cause of severe thrombocytopenia."
}}

OUTPUT FORMAT

{{
    "explanation": "...",
    "next_step": "..."
}}
"""
        )
        
        prompt = prompt_template.format(
            test_name=test_name,
            value=lab.get('value'),
            unit=lab.get('unit'),
            status=status,
            ref_text=ref_text,
            domain_context=domain_context
        )
        
        response = llm.invoke(prompt)
        
        data = json.loads(response.strip())
        
        if not isinstance(data, dict):
            raise ValueError("Invalid response")
        if not data.get("explanation"):
            raise ValueError("Missing explanation")
        if not data.get("next_step"):
            raise ValueError("Missing next step")
            
        return {
            "explanation": data["explanation"],
            "next_step": data["next_step"]
        }
    except Exception as e:
        print(f"Ollama/LangChain error: {e}")
        return {
            "explanation": "AI explanation temporarily unavailable.",
            "next_step": "Review the laboratory result using the supplied reference range."
        }
