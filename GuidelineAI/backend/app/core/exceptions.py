"""Domain exceptions for GuidelineAI.

These map to honest, non-leaking error responses (Phase 32 of the
product spec: never expose Python stack traces to users).
"""


class GuidelineAIError(Exception):
    """Base class for all handled GuidelineAI errors."""

    status_code = 500
    public_message = "Something went wrong while processing the request."

    def __init__(self, detail: str | None = None):
        super().__init__(detail or self.public_message)
        self.detail = detail or self.public_message


class GuidelineNotIndexedError(GuidelineAIError):
    status_code = 503
    public_message = "No clinical guideline is currently indexed."


class VectorDatabaseUnavailableError(GuidelineAIError):
    status_code = 503
    public_message = "Evidence retrieval is currently unavailable."


class GenerationUnavailableError(GuidelineAIError):
    status_code = 503
    public_message = "Response generation is currently unavailable."
