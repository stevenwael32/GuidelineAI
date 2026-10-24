from fastapi import APIRouter

from app.schemas import EvaluationReport, EvaluationTestResult
from app.services import evaluation_service
from app.services.guideline_service import app_state

router = APIRouter(tags=["evaluation"])


@router.get("/api/evaluation", response_model=EvaluationReport)
def get_evaluation():
    if not app_state.is_indexed or app_state.embedding_model is None:
        return EvaluationReport(available=False)

    tests = [EvaluationTestResult(**t) for t in evaluation_service.run_refusal_tests()]

    return EvaluationReport(
        available=True,
        tests=tests,
        quality_gate_1=evaluation_service.quality_gate_1_calibration(),
        quality_gate_2=evaluation_service.quality_gate_2_faithfulness(),
        quality_gate_3=evaluation_service.quality_gate_3_benchmark(),
    )
