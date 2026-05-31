# Security Policy

## Supported Versions

This open-source snapshot is maintained on a best-effort basis from the latest public branch.

## Reporting a Vulnerability

Please report suspected vulnerabilities through a private GitHub security advisory if the repository has advisories enabled. If not, contact the maintainer privately before opening a public issue.

Do not include real API keys, private conversations, personal data, or confidential files in public issues.

## Known Security Considerations

- API keys are stored in browser `localStorage`.
- Files and prompts may be transmitted to third-party APIs selected by the user.
- Markdown rendering uses `react-markdown`; keep raw HTML disabled unless a reviewed sanitizer is added.
- Debug logging is disabled by default because logs may include user prompts, file names, search queries, and provider responses.
- Contributors should not commit `node_modules`, local debug scripts, `.env` files, browser exports, logs, HAR files, or local database files.
