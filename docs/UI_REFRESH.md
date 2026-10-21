# Native-inspired UI and language selection

This revision keeps the recommendation algorithm and saved mail data unchanged.

- Frosted sidebar and utility surfaces; more opaque opportunity cards for legibility.
- System typography (Apple system fonts where available, Segoe UI Variable on Windows).
- Original, consistent outline SVG icons; no remotely loaded font or icon library.
- Chinese / English interface selector, stored in this browser independently of the personal profile.
- Original mail, saved summaries, checklist text and extracted field values are preserved. Selecting English does not translate these or trigger an AI request.
- Reduced-transparency and reduced-motion preferences retain readable fallbacks.

Design references: [Apple materials](https://developer.apple.com/design/human-interface-guidelines/materials), [typography](https://developer.apple.com/design/human-interface-guidelines/typography), [icons](https://developer.apple.com/design/human-interface-guidelines/icons). This is a browser implementation inspired by native tools, not a native Apple UI.

Verification update (2026-10-22): 50 Python tests and personalization, audit DOM and translation/SVG checks passed. The isolated Edge interaction test now passes English switching, Chinese restoration, preservation of original checklist text and unchanged personal state. The user accepted the current visual baseline. Four language/viewport screenshot targets are implemented but final recapture remains pending; existing screenshots predate this refresh. Full localization coverage is not yet measured.

Run the local server with `python E:\MailPhor\app.py --mode serve`, then force-refresh the browser. Review desktop and mobile layouts in both languages, expand card details, switch languages back, and confirm saved actions and checklists remain intact.
