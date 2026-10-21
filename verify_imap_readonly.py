"""Optional real QQ/IMAP smoke test: at most one message, no AI, no data writes."""
import json
import app


def main():
    settings = app.load_settings()
    if settings.imap_mark_as_read:
        raise RuntimeError("Read-only check requires IMAP_MARK_AS_READ=false")
    state = app.load_state()
    processed = set(state.get("processed_message_ids", [])) | set(state.get("processed_uid_keys", []))
    messages = app.fetch_recent_messages(settings, processed, limit=1)
    print(json.dumps({"status": "read_only_completed", "messages_read": len(messages),
                      "uid_cached_identifier_available": all(bool(message.get("imap_uid_key")) for message in messages),
                      "body_present": all(bool(message.get("body")) for message in messages),
                      "ai_calls": 0, "files_written": 0}, ensure_ascii=True))


if __name__ == "__main__":
    main()
