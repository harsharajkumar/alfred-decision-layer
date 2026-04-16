import pathlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from schemas import ScenarioInput
from evaluation_service import EvaluationProcessingError, evaluate_context
from engine import calculate_final_decision

app = FastAPI(title="alfred_ Decision Layer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/evaluate")
async def evaluate_scenario(payload: ScenarioInput):
    payload_data = payload.dict()

    # short-circuit: no message and no history means there's nothing to evaluate
    if not payload.latest_message and not payload.conversation_history:
        final_decision = "Ask a clarifying question"
        rationale = "Missing both the latest message and conversation history."
        return {
            "final_decision": final_decision,
            "rationale": rationale,
            "pipeline_data": {
                "status": "short_circuited",
                "inputs": payload_data,
                "final_parsed_decision": {
                    "final_decision": final_decision,
                    "rationale": rationale
                }
            }
        }

    try:
        evaluation, raw_output, prompt_sent = evaluate_context(
            payload.action_type,
            payload.proposed_parameters,
            payload.latest_message,
            payload.conversation_history,
            payload.user_state,
            payload.debug_options,
        )

        decision = calculate_final_decision(evaluation)

        # build the full debug payload so the UI can show the whole pipeline
        return {
            "final_decision": decision,
            "rationale": evaluation.reasoning,
            "pipeline_data": {
                "inputs": payload_data,
                "prompt_sent": prompt_sent,
                "raw_model_output": raw_output,
                "signals_computed": evaluation.dict(),
                "final_parsed_decision": {
                    "final_decision": decision,
                    "rationale": evaluation.reasoning
                }
            }
        }

    except EvaluationProcessingError as e:
        # evaluation failed (timeout, malformed JSON, etc.) — default to the safest outcome
        final_decision = "Refuse / escalate"
        rationale = f"Fallback applied: {str(e)}. The system returned the safest available decision."
        return {
            "final_decision": final_decision,
            "rationale": rationale,
            "pipeline_data": {
                "inputs": payload_data,
                "prompt_sent": e.prompt_sent,
                "raw_model_output": e.raw_output,
                "error": str(e),
                "error_type": e.error_type,
                "final_parsed_decision": {
                    "final_decision": final_decision,
                    "rationale": rationale
                }
            }
        }


# Serve built React frontend (production — only when dist/ exists)
_dist = pathlib.Path(__file__).parent.parent / "frontend" / "dist"
if _dist.exists():
    _assets = _dist / "assets"
    if _assets.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets)), name="assets")

    @app.get("/favicon.svg")
    async def favicon():
        return FileResponse(str(_dist / "favicon.svg"))

    @app.get("/icons.svg")
    async def icons():
        return FileResponse(str(_dist / "icons.svg"))

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        return FileResponse(str(_dist / "index.html"))
