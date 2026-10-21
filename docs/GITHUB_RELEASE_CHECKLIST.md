# GitHub release checklist

## Public files

- README.md
- PRD.md
- IMPLEMENTATION.md
- app.py and frontend assets
- fixtures and tests
- docs/ARCHITECTURE.md
- docs/ACCEPTANCE.md
- docs/CV_NOTES.md
- docs/screenshots/desktop.png and mobile.png

## Must stay private

- config.json and config.local.json
- opportunities.json
- mail_audit.json
- .mailphor_state.json
- sync_status.json
- .mailphor_retry_queue.json
- mailbox passwords, IMAP authorization codes, API keys and Telegram tokens
- screenshots or fixtures containing real names, addresses or mail bodies

## Before publishing

1. Run the Python, Node and isolated browser checks.
2. Verify the private-file ignore rules with git check-ignore.
3. Open the synthetic Demo and confirm the cards are synthetic.
4. Remove personal screenshots and copied email text.
5. Add a license only after choosing one deliberately.
6. Do not claim overall accuracy, production hosting or multi-user support.
