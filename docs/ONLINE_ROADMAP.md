# Online website roadmap

## Product decision

The online version will be a multi-user web application. Each user can configure:

- an IMAP mailbox: host, port, mailbox, account and app password/OAuth token;
- an AI provider and model from an allowlisted catalog;
- notification preferences;
- the same profile, categories and priority preferences already present in the MVP.

The browser must never receive or store raw mailbox credentials or AI keys. The backend owns provider calls and stores secrets encrypted. Arbitrary user-supplied AI endpoints are not allowed in the first hosted version, which avoids SSRF and unsafe routing.

## Architecture

Browser UI → authenticated API → worker/job queue → IMAP adapter → provider adapter → encrypted database

The existing Python localhost server is intentionally not exposed publicly. It uses raw IMAP TCP and local JSON files; the hosted runtime needs a server-side worker that supports the selected mail connection, durable database records, per-user jobs, rate limits and encrypted secrets. A public static Site can host the marketing/demo UI, but it cannot safely perform the private mailbox sync by itself.

## Provider adapters

- Mail: generic IMAP first; QQ, Gmail and personal Outlook are configurations of the adapter. University Outlook direct access remains optional because OAuth/tenant policy varies.
- AI: OpenAI-compatible provider adapter first. Store provider_id, model_id, API key reference and capability flags. Use explicit model IDs in production; free routers are best-effort and can route to unsuitable or rate-limited models.
- Notifications: terminal/local preview first; Telegram later as an optional per-user connector.

## Delivery stages

1. Local provider abstraction and setup documentation.
2. Hosted demo with synthetic data and no credentials.
3. Private hosted account with encrypted settings and one-user IMAP sync.
4. User-selectable mail/AI provider settings, audit records and retry controls.
5. Multi-user hardening, rate limits, deletion/export, privacy policy and only then public sharing.

## Acceptance gates

- A user can choose a supported mailbox without code changes.
- A user can choose a supported AI provider/model without exposing the key to JavaScript.
- A failed provider call is visible, cooled down and never marked irrelevant.
- Two users cannot read each other's mail, cards or audit records.
- The public demo contains synthetic data only.

This roadmap does not claim the hosted private backend already exists. It is the next implementation track after the local MVP.
