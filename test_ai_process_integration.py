"""Exercise spawned AI request processes against localhost, never a cloud API."""
import http.server
import json
import multiprocessing
import threading
import time
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

import app


class LocalAPI(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        self.rfile.read(int(self.headers.get("Content-Length", "0")))
        if self.path == "/slow":
            time.sleep(2)
        status = 402 if self.path == "/payment" else 200
        body = b'{"ok":true}' if status == 200 else b'{"error":"balance"}'
        try:
            self.send_response(status)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def log_message(self, *args):
        pass


class ProcessIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), LocalAPI)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(2)

    def request(self, path, timeout=5):
        settings = app.Settings(imap_email="", imap_password="", deepseek_api_key="synthetic-test-only")
        with patch.object(app, "get_ai_chat_endpoint", return_value=f"http://127.0.0.1:{self.server.server_port}{path}"):
            return app.generate_deepseek_once(settings, {}, total_timeout=timeout)

    def test_spawned_request_returns_and_releases_lock(self):
        self.assertEqual(self.request("/ok"), {"ok": True})
        self.assertFalse(app.AI_REQUEST_LOCK.locked())

    def test_http_status_survives_process_boundary(self):
        with self.assertRaises(HTTPError) as error:
            self.request("/payment")
        self.assertEqual(error.exception.code, 402)
        error.exception.close()
        self.assertFalse(app.AI_REQUEST_LOCK.locked())

    def test_timeout_cleans_child_and_allows_next_request(self):
        previous = {child.pid for child in multiprocessing.active_children()}
        with self.assertRaises(TimeoutError):
            self.request("/slow", timeout=0.5)
        self.assertEqual({child.pid for child in multiprocessing.active_children()}, previous)
        self.assertFalse(app.AI_REQUEST_LOCK.locked())
        self.assertEqual(self.request("/ok"), {"ok": True})


if __name__ == "__main__":
    unittest.main()
