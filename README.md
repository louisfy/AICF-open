# AICF Open

AICF Open is a browser-based AI chat interface for SiliconFlow-compatible models. It supports streaming chat, model selection, local conversation history, file upload, PDF-to-image conversion for vision models, translation, and optional Tavily-powered web search.

This repository is the clean open-source snapshot. It intentionally excludes private Git history, `node_modules`, local debug scripts, OS metadata, and any user data.

## Features

- Multi-model chat with SiliconFlow API endpoints
- Streaming responses and reasoning display for supported models
- Image and PDF handling for vision models
- Optional file upload to SiliconFlow
- Optional Tavily web search
- Local conversation and translation history
- Local model, prompt, avatar, and API key settings

## Privacy Notes

This is a client-side app. There is no bundled backend server.

- API keys are entered by the user in the browser UI and stored in browser `localStorage`.
- Conversation history, translation history, user avatar, model settings, and system prompt are also stored in browser `localStorage`.
- `localStorage` is not encrypted. Anyone with access to the browser profile may be able to read it.
- Chat messages are sent to the selected SiliconFlow API endpoint.
- Non-PDF file uploads may be sent to SiliconFlow for file processing.
- PDF files used with vision models are converted in the browser to images and sent as model input.
- Tavily search queries are sent to Tavily only when web search is enabled and a Tavily API key is configured.
- Debug logging is disabled by default. In development, it can be enabled intentionally with `localStorage.setItem('aicfDebugLogs', 'true')`.

Do not enter sensitive personal, business, legal, medical, or confidential data unless you understand the third-party API and browser-storage implications.

## Requirements

- Node.js 18 or newer
- npm 8 or newer

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server defaults to `http://localhost:5173`.

## Build

```bash
npm run build
```

## Configuration

Open the settings panel in the app and configure:

- SiliconFlow API key for chat, translation, model listing, and file upload
- Tavily API key for optional web search
- Model, generation parameters, system prompt, and user avatar

No API keys are committed to this repository. Do not add real keys to source files, `.env` files, examples, screenshots, or issues.

## Security Notes

AI responses are rendered with `react-markdown`, and raw HTML in Markdown is not rendered by default. Keep this behavior unless you add a trusted sanitizer such as DOMPurify and validate the full rendering pipeline.

Debug console output is disabled by default because it may include prompts, search queries, file names, and provider responses.

For security reporting, see [SECURITY.md](SECURITY.md).

## Repository Hygiene

This open-source snapshot should not include:

- `node_modules/`
- `.DS_Store`
- `debug-*.js`
- `.env*`
- browser exports, HAR files, logs, local databases, user conversations, or uploaded documents

## License

MIT. See [LICENSE](LICENSE).
