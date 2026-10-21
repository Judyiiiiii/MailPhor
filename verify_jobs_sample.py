"""Read-only cloud acceptance check for the supplied, non-personal jobs fixture."""
import json
from pathlib import Path
import time

import app


def main():
    root = Path(__file__).resolve().parent
    item = {"subject": "[Ext] Test Assistant (Part-time) + 11 new jobs", "body": (root / "fixtures" / "jobs_digest.txt").read_text(encoding="utf-8"),
            "message_id": "isolated-jobsdb-acceptance", "date": "", "from": ""}
    started = time.monotonic()
    expected = ["PERSOL", "Takasago", "Chevalier", "Technique", "PERSOL Hong Kong", "Ke Yao", "Cobra", "Sanbase", "SAE Magnetics", "Majestic", "Wing Lee", "Carrier"]
    try:
        cards = app.process_email(app.load_settings(), item)
        organizations = [str(card.get("organization", "")) for card in cards]
        found = [company for company in expected if any(company.casefold() in organization.casefold() for organization in organizations)]
        result = {"status": "completed", "count": len(cards), "organization_hints_found": found,
                  "cards": [{key: card.get(key) for key in ("title", "organization", "category", "deadline", "application_url", "checklist")} for card in cards],
                  "no_invented_dates_or_links": all(card["deadline"] == "Unknown" and not card["application_url"] for card in cards)}
        # Matching company names is a coverage hint, not a substitute for manual role-by-role review.
    except Exception as exc:
        result = {"status": "failed", "error_type": type(exc).__name__}
    result.update(elapsed_seconds=round(time.monotonic() - started, 2), diagnostics=item.get("ai_diagnostics", []))
    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()
