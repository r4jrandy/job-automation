Put exported n8n workflow JSON files here, e.g. `1B-portal-alerts.json`
(n8n editor: workflow menu > Download). Every `*.json` in this folder is imported on startup.
For GitHub Actions CLI execution, include an Execute Workflow Trigger connected to the same first processing node as the Schedule Trigger.
The Actions workflow exchanges the configured Google refresh-token secrets for short-lived access tokens before importing the Google credentials. Make sure each refresh token belongs to the configured Google OAuth client and has the required API scopes enabled.
