from pydantic import BaseModel, Field
from typing import Any, Dict, List, Literal, Optional


class DebugOptions(BaseModel):
    simulate_failure: Optional[Literal["timeout", "malformed_output"]] = None

class ScenarioInput(BaseModel):
    action_type: str
    proposed_parameters: Dict[str, Any] = Field(default_factory=dict)
    latest_message: str = ""
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)
    user_state: Dict[str, Any] = Field(default_factory=dict)
    debug_options: Optional[DebugOptions] = None

class ContextEvaluation(BaseModel):
    intent_clear: bool = Field(description="Is the user's core intent unambiguous?")
    missing_parameters: List[str] = Field(description="List of required parameters missing from the context. Empty if none.")
    contextual_risk_score: int = Field(description="Rate the risk of this specific action from 1 (harmless) to 10 (catastrophic) based on context.")
    contradiction_flag: bool = Field(description="True if the latest message contradicts a previous constraint (like waiting for approval).")
    reasoning: str = Field(description="A concise, 1-2 sentence explanation of your evaluation.")
