from typing import Any, Dict, List, Literal, Optional

DocumentType = Literal[
    "invoice",
    "receipt",
    "bank_statement",
    "resume",
    "contract",
    "form",
    "id_document",
    "unknown",
]

ModelMode = Literal["fast", "accurate"]


class ExtractOptions:
    """Options for the extract() method."""

    def __init__(
        self,
        type: Optional[DocumentType] = None,
        model: Optional[ModelMode] = None,
        schema: Optional[Dict[str, str]] = None,
    ) -> None:
        self.type = type
        self.model = model
        self.schema = schema

    def to_dict(self) -> Dict[str, Any]:
        d: Dict[str, Any] = {}
        if self.type is not None:
            d["type"] = self.type
        if self.model is not None:
            d["model"] = self.model
        if self.schema is not None:
            d["schema"] = self.schema
        return d


class ExtractMetadata:
    def __init__(self, data: Dict[str, Any]) -> None:
        self.type: str = data["type"]
        self.confidence: float = data["confidence"]
        self.model: str = data["model"]
        self.processing_time_ms: int = data["processing_time_ms"]
        self.page_count: int = data["page_count"]

    def __repr__(self) -> str:
        return (
            f"ExtractMetadata(type={self.type!r}, confidence={self.confidence}, "
            f"model={self.model!r}, processing_time_ms={self.processing_time_ms})"
        )


class ExtractResult:
    def __init__(self, data: Dict[str, Any]) -> None:
        self.data: Dict[str, Any] = data["data"]
        self.metadata: ExtractMetadata = ExtractMetadata(data["metadata"])

    def __repr__(self) -> str:
        return f"ExtractResult(type={self.metadata.type!r}, confidence={self.metadata.confidence})"


class DetectResult:
    def __init__(self, data: Dict[str, Any]) -> None:
        self.type: str = data["type"]
        self.confidence: float = data["confidence"]

    def __repr__(self) -> str:
        return f"DetectResult(type={self.type!r}, confidence={self.confidence})"


class UsageDayBreakdown:
    def __init__(self, data: Dict[str, Any]) -> None:
        self.date: str = data["date"]
        self.count: int = data["count"]

    def __repr__(self) -> str:
        return f"UsageDayBreakdown(date={self.date!r}, count={self.count})"


class UsageResult:
    def __init__(self, data: Dict[str, Any]) -> None:
        self.used: int = data["used"]
        self.limit: int = data["limit"]
        self.plan: str = data["plan"]
        self.period_end: str = data["period_end"]
        self.breakdown: List[UsageDayBreakdown] = [
            UsageDayBreakdown(b) for b in data.get("breakdown", [])
        ]

    def __repr__(self) -> str:
        return (
            f"UsageResult(used={self.used}, limit={self.limit}, "
            f"plan={self.plan!r}, period_end={self.period_end!r})"
        )
