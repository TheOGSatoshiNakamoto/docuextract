from typing import Any, Dict, Optional

import requests

from .types import DetectResult, ExtractOptions, ExtractResult, UsageResult

DEFAULT_BASE_URL = "https://docuextract-azure.vercel.app/v1"


class DocuExtractAPIError(Exception):
    """Raised when the DocuExtract API returns a non-2xx response."""

    def __init__(self, error: str, message: str, status: int) -> None:
        super().__init__(message)
        self.error = error
        self.message = message
        self.status = status

    def __repr__(self) -> str:
        return f"DocuExtractAPIError(error={self.error!r}, status={self.status})"


class DocuExtract:
    """
    DocuExtract API client.

    Usage::

        from docuextract import DocuExtract

        dex = DocuExtract("dex_live_YOUR_API_KEY")
        result = dex.extract("https://example.com/invoice.pdf", type="invoice")
        print(result.data)
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: int = 60,
    ) -> None:
        if not api_key:
            raise ValueError("DocuExtract: api_key is required")
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._session = requests.Session()
        self._session.headers.update({"Authorization": f"Bearer {api_key}"})

    def _request(
        self,
        method: str,
        path: str,
        json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        url = f"{self._base_url}{path}"
        resp = self._session.request(method, url, json=json, timeout=self._timeout)

        data: Dict[str, Any] = resp.json()

        if not resp.ok:
            raise DocuExtractAPIError(
                error=data.get("error", "unknown_error"),
                message=data.get("message", f"HTTP {resp.status_code}"),
                status=resp.status_code,
            )

        return data

    def extract(
        self,
        document: str,
        *,
        type: Optional[str] = None,
        model: Optional[str] = None,
        schema: Optional[Dict[str, str]] = None,
        options: Optional[ExtractOptions] = None,
    ) -> ExtractResult:
        """
        Extract structured data from a document.

        :param document: Base64-encoded document string or a publicly accessible URL.
        :param type:     Document type hint (invoice, receipt, resume, etc.). Auto-detected if omitted.
        :param model:    'fast' (default, Claude Haiku) or 'accurate' (Claude Sonnet).
        :param schema:   Custom extraction schema — dict of {field_name: description}.
        :param options:  Alternative to keyword args: pass an ExtractOptions object.
        :returns:        ExtractResult with .data and .metadata attributes.
        """
        body: Dict[str, Any] = {"document": document}

        # Keyword args take precedence over options object
        if type is not None:
            body["type"] = type
        elif options and options.type is not None:
            body["type"] = options.type

        if model is not None:
            body["model"] = model
        elif options and options.model is not None:
            body["model"] = options.model

        if schema is not None:
            body["schema"] = schema
        elif options and options.schema is not None:
            body["schema"] = options.schema

        return ExtractResult(self._request("POST", "/extract", json=body))

    def detect(self, document: str) -> DetectResult:
        """
        Detect the type of a document without extracting its data.

        :param document: Base64-encoded document string or a publicly accessible URL.
        :returns:        DetectResult with .type and .confidence attributes.
        """
        return DetectResult(self._request("POST", "/detect", json={"document": document}))

    def usage(self) -> UsageResult:
        """
        Get current usage statistics for the billing period.

        :returns: UsageResult with .used, .limit, .plan, .period_end, .breakdown.
        """
        return UsageResult(self._request("GET", "/usage"))

    def close(self) -> None:
        """Close the underlying requests session."""
        self._session.close()

    def __enter__(self) -> "DocuExtract":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()
