# Privacy

AICF Open is a client-side web application.

## Local Browser Storage

The app stores the following data in browser `localStorage`:

- SiliconFlow API key
- Tavily API key
- Conversation history
- Translation history
- System prompt
- User avatar
- Model and generation settings

`localStorage` is stored by the browser and is not encrypted by this app. Clear site data in your browser if you want to remove it.

## Third-Party Services

Depending on which features are enabled, the app may send data to:

- SiliconFlow: chat messages, model requests, translation prompts, file uploads, PDF-derived images
- Tavily: web search queries
- jsDelivr: PDF.js runtime files loaded by the PDF conversion helper

Review the privacy and data-retention policies of those services before using sensitive data.

## No Bundled Telemetry

This snapshot does not include analytics, tracking pixels, or a bundled backend service.

Debug logging is disabled by default. If a developer manually enables it in development, console output may include prompts, search queries, file names, and provider responses.
