"""Spelltrace processing worker.

Long-running pose extraction stays out of Next.js request handlers.
Pin the MediaPipe task when enabling real video jobs (algorithm pose-0.1).
"""

from __future__ import annotations

import hashlib
import json
import os
import re
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

ALGORITHM_VERSION = "pose-0.1"
PROMPT_VERSION = "gemini-athlete-narration-0.2"
MODEL_VERSION = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

MEDICAL = re.compile(
    r"(injur(y|ies|ed)|diagnos|fracture|tear|strain|sprain|risk\s*\d+\s*%|medical|prescribe|spell\s*cap|cycle\s*phase)",
    re.I,
)

app = FastAPI(title="Spelltrace worker", version=ALGORITHM_VERSION)


class JobRequest(BaseModel):
    video_id: str
    algorithm_version: str = ALGORITHM_VERSION
    private_object_path: str
    view: str
    bookmarks: list[dict[str, int]] = Field(default_factory=list)


class EvidenceItem(BaseModel):
    id: str
    modality: str
    feature: str | None = None
    current: float | None = None
    personalMedian: float | None = None
    sampleCount: int | None = None
    quality: str
    text: str


class EvidenceBundle(BaseModel):
    sessionId: str
    evidence: list[EvidenceItem]
    missing: list[str]
    consentScope: str


class GeminiSentence(BaseModel):
    text: str
    evidenceIds: list[str]


class GeminiOutput(BaseModel):
    sentences: list[GeminiSentence]
    questions: list[str] = Field(default_factory=list)


@app.get("/health")
def health() -> dict[str, str]:
    return {"ok": "true", "algorithm": ALGORITHM_VERSION}


@app.post("/jobs/process")
def process_job(req: JobRequest) -> dict[str, Any]:
    """Idempotent by (video_id, algorithm_version). Prototype path does not run MediaPipe unless configured."""
    if req.algorithm_version != ALGORITHM_VERSION:
        raise HTTPException(400, "unsupported_algorithm")
    if ".." in req.private_object_path or req.private_object_path.startswith("/"):
        raise HTTPException(400, "invalid_storage_path")

    # Real extraction: sample frames with OpenCV, run Pose Landmarker, persist traces.
    # Until a consented clip is supplied, mark the job complete only for synthetic ids.
    if req.video_id.startswith("vid-sess-") or req.video_id.startswith("vid-demo"):
        return {
            "state": "complete",
            "video_id": req.video_id,
            "algorithm_version": ALGORITHM_VERSION,
            "note": "Synthetic/demo path. No pixels reconstructed.",
        }
    return {
        "state": "queued",
        "video_id": req.video_id,
        "algorithm_version": ALGORITHM_VERSION,
        "note": "Enqueue behind a worker. Do not process in the Next.js handler.",
    }


def _numbers(bundle: EvidenceBundle) -> list[float]:
    out: list[float] = []
    for e in bundle.evidence:
        if e.current is not None:
            out.append(round(e.current, 1))
        if e.personalMedian is not None:
            out.append(round(e.personalMedian, 1))
        if e.sampleCount is not None:
            out.append(float(e.sampleCount))
    return out


def validate_gemini(raw: dict[str, Any], bundle: EvidenceBundle) -> tuple[bool, str]:
    try:
        output = GeminiOutput.model_validate(raw)
    except Exception:
        return False, "schema"
    allowed = {e.id for e in bundle.evidence}
    allowed_nums = _numbers(bundle)
    for sentence in output.sentences:
        if any(eid not in allowed for eid in sentence.evidenceIds):
            return False, "unknown_evidence_id"
        if MEDICAL.search(sentence.text):
            return False, "medical_or_causal"
        for m in re.findall(r"-?\d+(?:\.\d+)?", sentence.text):
            n = float(m)
            if 1900 <= n <= 2100 or (n.is_integer() and n <= 3):
                continue
            if not any(abs(a - n) < 0.15 or abs(round(a) - n) < 0.15 for a in allowed_nums):
                return False, "altered_figure"
    return True, "ok"


def evidence_hash(bundle: EvidenceBundle) -> str:
    payload = json.dumps(bundle.model_dump(), sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


@app.post("/explain")
def explain(bundle: EvidenceBundle, model_output: dict[str, Any] | None = None) -> dict[str, Any]:
    """Gemini stays server-side. GEMINI_API_KEY must never ship in a client bundle."""
    key = os.environ.get("GEMINI_API_KEY")
    if model_output is not None:
        ok, reason = validate_gemini(model_output, bundle)
        if not ok:
            return {"status": "rejected", "reason": reason, "source": "template", "hash": evidence_hash(bundle)}
        return {"status": "accepted", "source": "gemini", "hash": evidence_hash(bundle), "output": model_output}

    if not key:
        return {
            "status": "template",
            "source": "template",
            "hash": evidence_hash(bundle),
            "note": "GEMINI_API_KEY unset; deterministic template used. Review still works.",
        }

    # Official Google GenAI SDK call would go here with a versioned schema.
    return {
        "status": "template",
        "source": "template",
        "hash": evidence_hash(bundle),
        "model": MODEL_VERSION,
        "prompt": PROMPT_VERSION,
    }
