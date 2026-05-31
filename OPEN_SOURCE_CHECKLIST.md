# Open Source Release Checklist

Prepared in this snapshot:

- [x] Removed `node_modules/`, `.DS_Store`, local debug scripts, and the original private Git history.
- [x] Added `.gitignore`, `LICENSE`, `README.md`, `PRIVACY.md`, and `SECURITY.md`.
- [x] Removed unsafe `dangerouslySetInnerHTML` Markdown rendering from the app entrypoint.
- [x] Confirmed no real API keys or tokens were found in the prepared source snapshot.

Before publishing:

- [ ] Publish from this clean snapshot, not from the original private repository history.
- [ ] Re-run install/build/security checks after generating a fresh lockfile with your local npm.
- [ ] Confirm no real API keys or tokens appear in screenshots, issues, examples, or any newly added docs.
- [ ] Enable GitHub secret scanning and Dependabot alerts.
- [ ] Protect the default branch before accepting contributions.
- [ ] Re-run a secret scan on the final repository before making it public.
