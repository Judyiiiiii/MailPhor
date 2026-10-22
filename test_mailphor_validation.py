import unittest
from unittest.mock import patch

import app


class ClassificationValidationTests(unittest.TestCase):
    def setUp(self):
        self.settings = app.Settings(imap_email="", imap_password="")
        self.email = {"body": "sample", "subject": "sample", "message_id": "sample-id"}
        self.audit_mock = patch.object(app, "record_email_result").start()
        self.sync_mock = patch.object(app, "write_sync_status").start()
        self.addCleanup(patch.stopall)

    def test_missing_category_is_not_saved_as_a_card(self):
        with patch.object(app, "call_deepseek", return_value={"title": "sample"}):
            with self.assertRaisesRegex(RuntimeError, "缺少有效分类"):
                app.process_email(self.settings, self.email)

    def test_job_digest_negative_result_requires_review(self):
        from pathlib import Path
        body = (Path(__file__).parent / "fixtures" / "jobs_digest.txt").read_text(encoding="utf-8")
        item = {**self.email, "subject": "轉寄: [Ext] Test Assistant (Part-time) + 11 new jobs", "body": body}
        with patch.object(app, "call_deepseek", return_value={"opportunities": [], "reason": "推广"}):
            with self.assertRaises(app.ReviewRequired):
                app.process_email(self.settings, item)

    def test_external_senior_job_is_retained_without_invented_dates(self):
        item = {**self.email, "subject": "[Ext] jobs", "body": "Senior Engineer, 2 years experience"}
        with patch.object(app, "call_deepseek", return_value={"opportunities": [{"category": "internship", "title": "Senior Engineer", "details": {"eligibility": "2 years experience"}}]}):
            cards = app.process_email(self.settings, item)
        self.assertEqual(cards[0]["source_kind"], "external_forward")
        self.assertEqual(cards[0]["deadline"], "Unknown")
        self.assertEqual(cards[0]["application_url"], "")

    def test_negative_classification_retains_reason(self):
        with patch.object(app, "call_deepseek", return_value={"opportunities": [], "reason": "课程通知"}):
            self.assertEqual(app.process_email(self.settings, self.email), [])
        self.assertEqual(self.email["analysis_reason"], "课程通知")

    def test_ai_smoke_test_accepts_valid_json_without_reading_mail(self):
        with patch.object(app, "require_settings"), patch.object(app, "generate_deepseek_once", return_value={"choices": [{"message": {"content": '{"ok":true}'}, "finish_reason": "stop"}]}), patch.object(app, "fetch_recent_messages") as mailbox:
            app.test_deepseek_api(self.settings)
        mailbox.assert_not_called()

    def test_explicit_local_provider_endpoint_and_model_override_legacy_key_guess(self):
        settings = app.Settings(
            imap_email="",
            imap_password="",
            deepseek_api_key="ollama",
            deepseek_model="deepseek-chat",
            ai_provider="ollama",
            ai_base_url="http://127.0.0.1:11434/v1",
            ai_model="qwen2.5:7b",
        )
        self.assertEqual(app.get_ai_chat_endpoint(settings.deepseek_api_key, settings.ai_base_url), "http://127.0.0.1:11434/v1/chat/completions")
        self.assertEqual(app.get_ai_model(settings), "qwen2.5:7b")

    def test_serve_mode_does_not_load_credentials_or_run_ai_or_mail(self):
        with patch("sys.argv", ["app.py", "--mode", "serve"]), \
             patch.object(app, "start_web_server", return_value=None), \
             patch.object(app, "keep_web_server_alive"), \
             patch.object(app, "load_settings") as settings, \
             patch.object(app, "test_deepseek_api") as ai, \
             patch.object(app, "run_once") as mail:
            app.main()
        settings.assert_not_called()
        ai.assert_not_called()
        mail.assert_not_called()

    def test_reanalysis_queue_is_explicit_idempotent_and_keeps_originals(self):
        import tempfile,json
        from pathlib import Path
        with tempfile.TemporaryDirectory() as directory:
            audit=Path(directory,'audit.json');retry=Path(directory,'retry.json')
            original=json.dumps([{'message_id':'one','body_excerpt':'saved body','status':'failed'}])
            audit.write_text(original,encoding='utf-8')
            with patch.object(app,'AUDIT_FILE',audit),patch.object(app,'RETRY_FILE',retry):
                app.queue_reanalysis('one');app.queue_reanalysis('one')
                self.assertEqual(json.loads(retry.read_text()),['one'])
                self.assertEqual(audit.read_text(encoding='utf-8'),original)
                with self.assertRaises(ValueError):app.queue_reanalysis('unknown')

    def test_sync_api_blocks_cross_origin_and_accepts_local_explicit_action(self):
        import functools,json,threading,tempfile
        from urllib.request import Request,urlopen
        from urllib.error import HTTPError
        with tempfile.TemporaryDirectory() as directory:
            server=app.http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(app.DashboardHandler,directory=directory))
            thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
            base=f'http://127.0.0.1:{server.server_port}'
            try:
                with patch.object(app,'control_sync',return_value={'message':'test-only'}) as control:
                    request=Request(base+'/api/sync',data=b'{"action":"once"}',headers={'Content-Type':'application/json','Origin':'https://untrusted.example'})
                    with self.assertRaises(HTTPError) as error:urlopen(request)
                    self.assertEqual(error.exception.code,403);error.exception.close();control.assert_not_called()
                    request=Request(base+'/api/sync',data=b'{"action":"once"}',headers={'Content-Type':'application/json','Origin':base})
                    with urlopen(request) as response:self.assertEqual(json.load(response),{'message':'test-only'})
                    control.assert_called_once_with('once')
            finally:
                server.shutdown();server.server_close();thread.join(2)

    def test_periodic_controller_stop_prevents_next_batch(self):
        import threading
        called=threading.Event()
        with patch.object(app,'load_settings',return_value=self.settings),patch.object(app,'run_once',side_effect=lambda settings:called.set()) as run:
            app.control_sync('watch')
            self.assertTrue(called.wait(2))
            app.control_sync('stop')
            app.SYNC_THREAD.join(2)
            self.assertFalse(app.SYNC_THREAD.is_alive())
            self.assertEqual(run.call_count,1)

    def test_ai_smoke_test_reports_truncation(self):
        with patch.object(app, "require_settings"), patch.object(app, "generate_deepseek_once", return_value={"choices": [{"message": {"content": '{"ok":'}, "finish_reason": "length"}]}):
            with self.assertRaisesRegex(RuntimeError, "截断"):
                app.test_deepseek_api(self.settings)

    def test_sports_and_student_organisations_are_valid_events(self):
        for subtype in ("sports_wellness", "student_organisation"):
            with self.subTest(subtype=subtype), patch.object(app, "call_deepseek", return_value={"opportunities": [{"category": "event", "subcategory": subtype, "tags": ["EE", "EE"]}]}):
                cards = app.process_email(self.settings, self.email)
                self.assertEqual(cards[0]["subcategory"], subtype)
                self.assertEqual(cards[0]["tags"], ["EE"])

    def test_invalid_event_subcategory_falls_back_without_losing_card(self):
        card = app.normalize_card({"category": "event", "subcategory": ["invalid"], "tags": "bad"}, self.email)
        self.assertEqual(card["subcategory"], "other")
        self.assertEqual(card["tags"], [])

    def test_dashboard_does_not_serve_secrets_or_directory_listing(self):
        import functools
        import tempfile
        import threading
        from pathlib import Path
        from urllib.request import urlopen
        from urllib.error import HTTPError

        with tempfile.TemporaryDirectory() as directory:
            Path(directory, "index.html").write_text("dashboard", encoding="utf-8")
            Path(directory, "config.local.json").write_text("test-secret", encoding="utf-8")
            handler = functools.partial(app.DashboardHandler, directory=directory)
            server = app.http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            base = f"http://127.0.0.1:{server.server_port}"
            try:
                with urlopen(base + "/") as response:
                    self.assertEqual(response.read(), b"dashboard")
                for path in ("/config.local.json", "/%63onfig.local.json", "/.git/config", "/app.py", "/../config.local.json"):
                    with self.subTest(path=path), self.assertRaises(HTTPError) as error:
                        urlopen(base + path)
                    self.assertEqual(error.exception.code, 404)
                    error.exception.close()
            finally:
                server.shutdown()
                server.server_close()
                thread.join(2)

    def test_failed_json_write_preserves_existing_data(self):
        import tempfile
        from pathlib import Path
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory, "data.json")
            path.write_text('["original"]', encoding="utf-8")
            with self.assertRaises(TypeError):
                app.save_json_file(path, {"bad": object()})
            self.assertEqual(path.read_text(encoding="utf-8"), '["original"]')
            self.assertEqual(list(Path(directory).glob(".mailphor-write-*")), [])

    def test_imap_opens_mailbox_readonly_by_default(self):
        with patch.object(app.imaplib, "IMAP4_SSL") as constructor:
            constructor.return_value.select.return_value = ("OK", [])
            app.connect_imap(self.settings)
        constructor.return_value.select.assert_called_once_with("INBOX", readonly=True)

    def test_string_details_are_kept_as_one_field(self):
        card = app.normalize_card({"category": "event", "details": "日期：2026-10-25"}, self.email)
        self.assertEqual(card["details"], {"详细信息": "日期：2026-10-25"})

    def test_checklist_is_preserved_and_in_copy_context(self):
        card = app.normalize_card({"category": "event", "checklist": ["提交申请表", "准备 CV"]}, self.email)
        self.assertEqual(card["checklist"], ["提交申请表", "准备 CV"])
        self.assertEqual(card["checklist_status"], "extracted")
        self.assertIn("准备 CV", card["ai_prompt_context"])

    def test_missing_checklist_is_distinct_from_explicit_empty_list(self):
        missing = app.normalize_card({"category": "event"}, self.email)
        empty = app.normalize_card({"category": "event", "checklist": []}, self.email)
        self.assertEqual(missing["checklist_status"], "missing")
        self.assertEqual(empty["checklist_status"], "not_specified")

    def test_ai_request_includes_checklist_contract(self):
        with patch.object(app, "generate_deepseek_once", return_value={"choices": [{"message": {"content": '{"opportunities": []}'}}]}) as request:
            app.call_deepseek(self.settings, self.email)
        prompt = request.call_args.args[1]["messages"][0]["content"]
        self.assertIn("details,checklist", prompt)
        self.assertIn("输出语言为中英结合", prompt)
        self.assertIn("Personal Statement", prompt)

    def test_invalid_details_become_empty_object(self):
        for value in (None, 12, True):
            with self.subTest(value=value):
                card = app.normalize_card({"category": "event", "details": value}, self.email)
                self.assertEqual(card["details"], {})

    def test_networking_category_is_accepted(self):
        with patch.object(app, "call_deepseek", return_value={"opportunities": [{"category": "networking", "title": "Alumni mentoring"}]}):
            cards = app.process_email(self.settings, self.email)
        self.assertEqual(cards[0]["category"], "networking")
        self.assertIn("人脉交流", app.build_notification(cards[0], "localhost"))

    def test_punctuation_duplicate_is_not_saved(self):
        first = {"id": "first", "category": "event", "title": "EEHS — Recruitment", "deadline": "2026-10-25"}
        second = {**first, "id": "second", "title": "EEHS Recruitment"}
        with patch.object(app, "load_opportunities", return_value=[first]), patch.object(app, "save_opportunities") as save:
            self.assertFalse(app.upsert_opportunity(second))
        save.assert_not_called()

    def test_format_failure_defers_mail_but_processes_next(self):
        state = {"processed_message_ids": []}
        second = {**self.email, "message_id": "second-id"}
        with patch.object(app, "require_settings"), patch.object(app, "load_state", return_value=state), \
             patch.object(app, "fetch_recent_messages", return_value=[self.email, second]), \
             patch.object(app, "process_email", side_effect=[app.AIResponseError("invalid"), []]), \
             patch.object(app, "save_state"), patch.object(app.time, "sleep"):
            app.run_once(self.settings)
        self.assertIn("sample-id", state["deferred_messages"])
        self.assertIn("second-id", state["processed_message_ids"])
        self.assertNotIn("sample-id", state["processed_message_ids"])
        self.assertEqual(self.audit_mock.call_args_list[0].args[1], "deferred")
        self.assertEqual(self.audit_mock.call_args_list[1].args[1], "no_opportunity")

    def test_source_domain_boundary(self):
        self.assertTrue(app.matches_source("Student <name@gapps.cityu.edu.hk>", "cityu.edu.hk"))
        self.assertFalse(app.matches_source("name@cityu.edu.hk.evil.com", "cityu.edu.hk"))
        self.assertFalse(app.matches_source("name@qq.com", "cityu.edu.hk"))

    def test_total_timeout_does_not_start_overlapping_requests(self):
        import queue
        class Inbox(queue.Queue):
            def close(self): pass
            def cancel_join_thread(self): pass
        context=unittest.mock.MagicMock()
        context.Queue.return_value=Inbox()
        process=context.Process.return_value
        process.pid=123
        process.is_alive.side_effect=[True,True,False]
        with patch('multiprocessing.get_context',return_value=context):
            with self.assertRaises(TimeoutError):
                app.generate_deepseek_once(self.settings,{},total_timeout=0.01)
        process.terminate.assert_called_once()
        self.assertFalse(app.AI_REQUEST_LOCK.locked())

    def test_ai_process_setup_failure_releases_lock(self):
        with patch('multiprocessing.get_context',side_effect=RuntimeError('setup')):
            with self.assertRaises(RuntimeError):
                app.generate_deepseek_once(self.settings,{})
        self.assertFalse(app.AI_REQUEST_LOCK.locked())

    def test_unsubstantiated_deadline_and_link_are_cleared(self):
        card = app.normalize_card({"category": "event", "deadline": "2026-12-01", "application_url": "https://invented.example"}, self.email)
        self.assertEqual(card["deadline"], "Unknown")
        self.assertEqual(card["application_url"], "")

    def test_matching_evidence_is_retained(self):
        body = "Apply by 2026-12-01 at https://example.edu/apply"
        card = app.normalize_card({"category": "event", "deadline": "2026-12-01", "deadline_evidence": "Apply by 2026-12-01", "evidence_quote": body, "application_url": "https://example.edu/apply"}, {**self.email, "body": body})
        self.assertEqual(card["deadline"], "2026-12-01")
        self.assertEqual(card["application_url"], "https://example.edu/apply")

    def test_invalid_json_retries_once_then_recovers(self):
        replies = [{"choices": [{"message": {"content": "not json"}}]},
                   {"choices": [{"message": {"content": '{"opportunities": []}'}}]}]
        with patch.object(app, "generate_deepseek_once", side_effect=replies) as request:
            self.assertEqual(app.call_deepseek(self.settings, self.email), {"opportunities": []})
        self.assertEqual(request.call_count, 2)

    def test_digest_output_budget_is_larger_and_truncation_retry_is_bounded(self):
        budgets=[]
        def reply(settings,payload):
            budgets.append(payload['max_tokens'])
            return {"choices": [{"finish_reason": "length", "message": {"content": "partial"}}]}
        item={**self.email,"subject":"Test Assistant + 11 new jobs"}
        with patch.object(app,"generate_deepseek_once",side_effect=reply):
            with self.assertRaises(app.AIResponseError):
                app.call_deepseek(self.settings,item)
        self.assertEqual(budgets,[5400,8000])
        self.assertEqual(item['ai_diagnostics'][1]['max_output_tokens'],8000)

    def test_invalid_json_has_bounded_retries(self):
        with patch.object(app, "generate_deepseek_once", return_value={"choices": [{"message": {"content": "invalid"}}]}) as request:
            with self.assertRaises(app.AIResponseError):
                app.call_deepseek(self.settings, self.email)
        self.assertEqual(request.call_count, 2)

    def test_valid_category_builds_a_card(self):
        with patch.object(app, "call_deepseek", return_value={"category": "event", "title": "sample"}):
            card = app.process_email(self.settings, self.email)
        self.assertEqual(card[0]["category"], "event")

    def test_irrelevant_result_is_not_a_card(self):
        with patch.object(app, "call_deepseek", return_value={"category": "irrelevant", "should_keep": False}):
            self.assertEqual(app.process_email(self.settings, self.email), [])

    def test_digest_produces_two_cards(self):
        response = {"opportunities": [{"category": "event", "title": "Talk"}, {"category": "competition", "title": "Challenge"}]}
        with patch.object(app, "call_deepseek", return_value=response):
            cards = app.process_email(self.settings, self.email)
        self.assertEqual(len(cards), 2)
        self.assertNotEqual(cards[0]["id"], cards[1]["id"])

    def test_identity_does_not_depend_on_forwarded_message(self):
        first = app.normalize_card({"category": "event", "title": "Talk", "details": {"date_time": "2026-10-31 15:00"}}, self.email)
        second = app.normalize_card({"category": "event", "title": "Talk", "details": {"date_time": "2026-10-31 15:00"}}, {**self.email, "message_id": "other"})
        self.assertEqual(first["id"], second["id"])

    def test_different_appointment_sessions_are_not_duplicates(self):
        from pathlib import Path
        body = (Path(__file__).parent / "fixtures" / "mhc_appointment.txt").read_text(encoding="utf-8")
        with patch.object(app, "call_deepseek") as ai:
            first = app.process_email(self.settings, {**self.email, "body": body})[0]
            second = app.process_email(self.settings, {**self.email, "body": body.replace("Oct 31", "Oct 28").replace("2131", "2128")})[0]
        ai.assert_not_called()
        self.assertNotEqual(first["id"], second["id"])
        self.assertEqual(second["details"]["date_time"], "Oct 28")
        self.assertEqual(second["deadline"], "Unknown")
        with patch.object(app, "load_opportunities", return_value=[first]), patch.object(app, "save_opportunities") as save:
            self.assertTrue(app.upsert_opportunity(second))
        save.assert_called_once()

    def test_legacy_id_collision_cannot_merge_different_links(self):
        first = {"id": "legacy-collision", "category": "event", "title": "MHC", "application_url": "https://canvas.cityu.edu.hk/appointment_groups/2131"}
        second = {**first, "application_url": "https://canvas.cityu.edu.hk/appointment_groups/2128"}
        with patch.object(app, "load_opportunities", return_value=[first]), patch.object(app, "save_opportunities"):
            self.assertTrue(app.upsert_opportunity(second))

    def test_same_session_forward_is_duplicate(self):
        first = {"id": "one", "category": "event", "title": "MHC — Signup", "organization": "MHC", "details": {"date_time": "Oct 31"}, "application_url": "https://example.edu/session/1"}
        second = {**first, "id": "two", "title": "MHC Signup"}
        with patch.object(app, "load_opportunities", return_value=[first]), patch.object(app, "save_opportunities") as save:
            self.assertFalse(app.upsert_opportunity(second))
        save.assert_not_called()

    def test_template_does_not_extract_confirmation_or_closed_appointment(self):
        from pathlib import Path
        body = (Path(__file__).parent / "fixtures" / "mhc_appointment.txt").read_text(encoding="utf-8")
        self.assertIsNone(app.extract_learning_appointment({"body": body.replace('Time slots for "MHC" are now available for signup.', 'Your appointment is confirmed.')}))
        self.assertIsNone(app.extract_learning_appointment({"body": body.replace("slots: 6", "slots: 0")}))

    def test_diagnostics_report_truncated_model_and_do_not_store_content(self):
        reply = {"model": "provider/test-model", "choices": [{"finish_reason": "length", "message": {"content": '{"private-body":'}}]}
        with patch.object(app, "generate_deepseek_once", return_value=reply):
            with self.assertRaises(app.AIResponseError):
                app.process_email(self.settings, self.email)
        diagnostics = self.email["ai_diagnostics"]
        self.assertEqual(len(diagnostics), 2)
        self.assertEqual(diagnostics[-1]["actual_model"], "provider/test-model")
        self.assertEqual(diagnostics[-1]["finish_reason"], "length")
        self.assertIn("截断", diagnostics[-1]["failure"])
        self.assertNotIn("private-body", str(diagnostics))

    def test_timeout_diagnostics_survive_process_failure(self):
        with patch.object(app, "generate_deepseek_once", side_effect=TimeoutError("timeout")):
            with self.assertRaises(TimeoutError):
                app.process_email(self.settings, self.email)
        self.assertEqual(self.email["ai_diagnostics"][0]["error_kind"], "TimeoutError")

    def test_safety_model_is_rejected_without_format_retry(self):
        reply = {"model": "nvidia/nemotron-3.5-content-safety:free", "choices": [{"finish_reason": "stop", "message": {"content": "safe"}}]}
        with patch.object(app, "generate_deepseek_once", return_value=reply) as request:
            with self.assertRaises(app.AIModelError):
                app.process_email(self.settings, self.email)
        self.assertEqual(request.call_count, 1)
        self.assertEqual(self.email["ai_diagnostics"][0]["status"], "routing_rejected")

    def test_model_routing_failure_stops_batch_and_keeps_mail(self):
        state = {"processed_message_ids": []}
        with patch.object(app, "require_settings"), patch.object(app, "load_state", return_value=state), \
             patch.object(app, "fetch_recent_messages", return_value=[self.email, {**self.email,"message_id":"second"}]), \
             patch.object(app, "process_email", side_effect=app.AIModelError("unsuitable model")) as process, \
             patch.object(app, "save_state"), patch.object(app.time, "sleep"):
            app.run_once(self.settings)
        self.assertEqual(process.call_count, 1)
        self.assertEqual(state["processed_message_ids"], [])
        self.assertIn("sample-id", state["deferred_messages"])
        self.assertEqual(self.sync_mock.call_args.args[0]["deferred"], 1)

    def test_network_failure_is_deferred_not_irrelevant(self):
        state = {"processed_message_ids": []}
        with patch.object(app, "require_settings"), patch.object(app, "load_state", return_value=state), \
             patch.object(app, "fetch_recent_messages", return_value=[self.email]), \
             patch.object(app, "process_email", side_effect=app.URLError("IncompleteRead")), \
             patch.object(app, "save_state"), patch.object(app.time, "sleep"):
            app.run_once(self.settings)
        self.assertEqual(state["processed_message_ids"], [])
        self.assertIn("sample-id", state["deferred_messages"])
        self.assertEqual(self.audit_mock.call_args.args[1], "deferred")

    def test_html_preserves_application_link(self):
        self.assertIn("https://example.edu/apply", app.html_to_text('<a href="https://example.edu/apply">申请</a>'))

    def test_failed_classification_is_not_marked_processed(self):
        state = {"processed_message_ids": []}
        with patch.object(app, "require_settings"), patch.object(app, "load_state", return_value=state), \
             patch.object(app, "fetch_recent_messages", return_value=[self.email]), \
             patch.object(app, "process_email", side_effect=RuntimeError("invalid result")), \
             patch.object(app, "save_state"), patch.object(app.time, "sleep"):
            app.run_once(self.settings)
        self.assertNotIn("sample-id", state["processed_message_ids"])
        self.assertEqual(self.sync_mock.call_args.args[0]['failed'],1)
        self.assertEqual(self.sync_mock.call_args.args[0]['status'],'completed_with_issues')

    def test_uid_cache_skips_header_fetch_and_validity_change_invalidates_cache(self):
        import uuid
        header=b'From: source@cityu.edu.hk\r\nMessage-ID: <test>\r\n\r\n'
        scope=str(uuid.uuid5(uuid.NAMESPACE_URL,f'{self.settings.imap_host}||INBOX|10'))
        client=unittest.mock.MagicMock()
        client.response.return_value=('UIDVALIDITY',[b'10'])
        def response(command,*args):
            if command=='search':return 'OK',[b'1']
            return 'OK',[(b'header',header),(b'body',b'sample')]
        client.uid.side_effect=response
        with patch.object(app,'connect_imap',return_value=client):
            self.assertEqual(app.fetch_recent_messages(self.settings,{f'uid:{scope}:1'}),[])
        self.assertEqual(client.uid.call_count,1)
        client.uid.reset_mock()
        client.response.return_value=('UIDVALIDITY',[b'11'])
        with patch.object(app,'connect_imap',return_value=client):
            messages=app.fetch_recent_messages(self.settings,{f'uid:{scope}:1'})
        self.assertEqual(len(messages),1)
        self.assertNotEqual(messages[0]['imap_uid_key'],f'uid:{scope}:1')
        self.assertEqual(client.uid.call_count,3)


if __name__ == "__main__":
    unittest.main()
