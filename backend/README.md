# Backend Architecture — Clinical Lab Results Analyzer

This backend is designed as a robust, Explainable AI pipeline using FastAPI, LangGraph, and Ollama. It enforces strict deterministic classification before relying on an LLM for clinical explanations.

## Architecture Flow

```text
React Frontend
      ↓
FastAPI (REST Endpoint)
      ↓
Python LangGraph Agent
      ↓
Local Reference Lookup / MCP Tool
      ↓
Deterministic Classification
      ↓
Severity Priority Routing
      ↓
Ollama (Qwen2.5:7B)

Local lookup is attempted first. When a test is not available in the local dictionary, the LangGraph Agent invokes the MCP `reference_range_lookup` tool to fetch the required reference boundaries dynamically. If the MCP tool fails to find a test, the pipeline handles it safely as an `Unknown` status without crashing.

## GenAI Integration

We use **Ollama running Qwen2.5:7B** to generate patient-friendly clinical explanations and structured next steps. 
The LLM is tightly controlled via a prompt template equipped with **few-shot examples** and **domain context hints** to ensure it explains the deterministic classification without inventing medical conditions, fabricating reference ranges, or making definitive diagnoses.

## Safety & Fallbacks

- **Invalid and Unknown results** are handled deterministically and are NOT given clinical interpretations by the LLM. They bypass the LLM entirely to prevent hallucinations.
- **LLM Failure**: If the LLM is unreachable or returns malformed JSON, the pipeline safely catches the error and returns a generic fallback explanation, completely preserving the deterministic classification logic.

## Why No RAG?

RAG (Retrieval-Augmented Generation) was intentionally **not used** because reference ranges are structured mathematical data. Deterministic hash-map/MCP lookup is structurally safer, much faster, and clinically more appropriate for resolving strict numerical boundaries than semantic search.
