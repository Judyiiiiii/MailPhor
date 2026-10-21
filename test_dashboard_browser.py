"""Isolated browser integration check using synthetic mail only."""
import functools
import http.server
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
from unittest.mock import patch
import app


def main():
    root = Path(__file__).resolve().parent
    browser = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
    if not browser.exists():
        raise RuntimeError("Edge not found: browser integration check not run")
    with tempfile.TemporaryDirectory(prefix="mailphor-browser-") as directory:
        temporary = Path(directory)
        public = temporary / "public"
        public.mkdir()
        for name in ("index.html", "personalization.js", "styles.css", "demo.json", "icons.js", "i18n.js"):
            shutil.copy2(root / name, public / name)
        cards = [
            {"id":"test-project","category":"competition","title":"Python Hardware Project","organization":"Demo Lab","details":{"eligibility":"Year 2+; CGPA 3.5"},"checklist":["提交 CV"],"deadline":"2026-10-30"},
            {"id":"test-sport","category":"event","subcategory":"sports_wellness","title":"Marathon","organization":"Demo Sports","details":{},"checklist":[],"deadline":"Unknown"},
        ]
        (public / "opportunities.json").write_text(json.dumps(cards, ensure_ascii=False), encoding="utf-8")
        (public / "mail_audit.json").write_text(json.dumps([{"message_id":"synthetic-audit","body_excerpt":"synthetic body","status":"failed"}]),encoding="utf-8")
        shutil.copy2(root / "fixtures" / "dashboard_browser_check.html", public / "check.html")
        class TestDashboard(app.DashboardHandler):
            def send_head(self):
                if self.path == "/check.html":
                    return http.server.SimpleHTTPRequestHandler.send_head(self)
                return super().send_head()
        handler = functools.partial(TestDashboard, directory=str(public))
        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            command = [str(browser), "--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
                       "--disable-background-networking", "--virtual-time-budget=15000", "--dump-dom",
                       "--user-data-dir=" + str(temporary / "browser-profile"),
                       f"http://127.0.0.1:{server.server_port}/check.html"]
            def synthetic_sync(settings):
                app.save_json_file(public / "sync_status.json", {"status":"completed","attempted":1,"new_opportunities":0,"started_at":"2026-10-21T00:00:00Z","finished_at":"2026-10-21T00:00:01Z"})
            with patch.object(app,"AUDIT_FILE",public / "mail_audit.json"),patch.object(app,"RETRY_FILE",public / "retry.json"), \
                 patch.object(app,"load_settings",return_value=app.Settings(imap_email="",imap_password="")),patch.object(app,"run_once",side_effect=synthetic_sync):
                result = subprocess.run(command, capture_output=True, timeout=60)
            output = result.stdout.decode("utf-8", errors="replace")
            if 'data-result="passed"' not in output:
                # Only the synthetic check document is printed, never personal mail.
                raise AssertionError("Browser check failed: " + output[:7000] + "\n" + result.stderr.decode("utf-8", errors="replace")[-1500:])
            assert json.loads((public / "retry.json").read_text()) == ["synthetic-audit"]
            print("Browser integration passed: profile, recommendations, favorites, application, checklist reload, ignored/all, sync UI and reanalysis queue (synthetic only).")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(2)


if __name__ == "__main__":
    main()
