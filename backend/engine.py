from schemas import ContextEvaluation

def calculate_final_decision(evaluation: ContextEvaluation) -> str:
    """
    Takes the parsed evaluation and applies deterministic safety rules.
    """
    # 1. Missing data or confusion
    if not evaluation.intent_clear or len(evaluation.missing_parameters) > 0:
        return "Ask a clarifying question"

    # 2. Contextual Risk Policy Limits
    risk = evaluation.contextual_risk_score
    if risk >= 8:
        return "Refuse / escalate"

    # 3. Contradictions require explicit confirmation (risk is already below refuse threshold)
    if evaluation.contradiction_flag:
        return "Confirm before executing"

    if risk >= 6:
        return "Confirm before executing"
    elif risk >= 3:
        return "Execute and tell the user after"
    else:
        return "Execute silently"
