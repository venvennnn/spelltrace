from main import EvidenceBundle, EvidenceItem, validate_gemini


def bundle() -> EvidenceBundle:
    return EvidenceBundle(
        sessionId="s1",
        missing=["delivery-level watch recording"],
        consentScope="metrics_only",
        evidence=[
            EvidenceItem(
                id="pose:trunk:d1",
                modality="pose",
                feature="trunk_lateral_angle_at_foot_contact_deg",
                current=18.2,
                personalMedian=10.4,
                sampleCount=42,
                quality="adequate",
                text="Lateral trunk angle was greater than in most comparable earlier deliveries.",
            )
        ],
    )


def test_rejects_medical_and_altered_numbers():
    b = bundle()
    ok, reason = validate_gemini(
        {"sentences": [{"text": "You have a 40% injury risk.", "evidenceIds": ["pose:trunk:d1"]}], "questions": []},
        b,
    )
    assert ok is False
    assert reason == "medical_or_causal"
    ok, reason = validate_gemini(
        {"sentences": [{"text": "Trunk lean was 99 degrees.", "evidenceIds": ["pose:trunk:d1"]}], "questions": []},
        b,
    )
    assert ok is False
    assert reason == "altered_figure"
    ok, reason = validate_gemini(
        {"sentences": [{"text": "Something changed.", "evidenceIds": ["missing-id"]}], "questions": []},
        b,
    )
    assert ok is False
