import json
import os
from dotenv import load_dotenv
from openai import OpenAI
from schemas import ContextEvaluation, DebugOptions

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


class EvaluationProcessingError(ValueError):
    def __init__(self, message: str, *, prompt_sent: str = "", raw_output: str = "", error_type: str = "evaluation_failed"):
        super().__init__(message)
        self.prompt_sent = prompt_sent
        self.raw_output = raw_output
        self.error_type = error_type


SYSTEM_PROMPT = """
You review requests for alfred_, a text-message assistant.
Your job is NOT to execute actions or make the final decision. Your job is to evaluate the conversation context and return a precise JSON assessment.

You must consider the full context, including:
- the proposed action and parameters
- the latest user message
- the conversation history
- user state such as standing instructions, trust level, preferences, or prior approvals

Assess the contextual risk (1-10). Examples: 
- 1: Reading own calendar, setting personal reminder.
- 5: Scheduling a meeting with a colleague.
- 8: Sending a financial proposal to an external client.
- 10: Deleting a database or wiping an inbox.

Output MUST be valid JSON matching this schema:
{
  "intent_clear": boolean,
  "missing_parameters": [string],
  "contextual_risk_score": integer,
  "contradiction_flag": boolean,
  "reasoning": string
}
"""


def evaluate_context(
    action_type: str,
    parameters: dict,
    latest_message: str,
    history: list,
    user_state: dict | None = None,
    debug_options: DebugOptions | None = None,
) -> tuple:
    user_state = user_state or {}
    user_prompt = f"""
    Proposed Action: {action_type}
    Proposed Parameters: {json.dumps(parameters)}
    Latest Message: "{latest_message}"
    Conversation History: {json.dumps(history)}
    User State: {json.dumps(user_state)}
    """

    full_prompt = f"=== SYSTEM PROMPT ===\n{SYSTEM_PROMPT.strip()}\n\n=== USER PROMPT ==={user_prompt}"
    raw_output = ""

    try:
        failure_mode = debug_options.simulate_failure if debug_options else None

        if failure_mode == "timeout":
            raise TimeoutError("Simulated timeout for UI demo.")

        if failure_mode == "malformed_output":
            raw_output = '{"intent_clear": true, "missing_parameters": "recipient"}'
        else:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                timeout=5.0
            )

            raw_output = response.choices[0].message.content or ""

        evaluation = ContextEvaluation.parse_raw(raw_output)
        return evaluation, raw_output, full_prompt

    except Exception as e:
        raise EvaluationProcessingError(
            f"Evaluation failed: {str(e)}",
            prompt_sent=full_prompt,
            raw_output=raw_output,
            error_type=(debug_options.simulate_failure if debug_options and debug_options.simulate_failure else "evaluation_failed"),
        )
