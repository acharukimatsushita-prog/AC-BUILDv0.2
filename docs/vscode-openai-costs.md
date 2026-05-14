# VSCode OpenAI cost watcher

This workspace includes a VSCode task that shows OpenAI API costs in a dedicated terminal.

Setup:

1. Create `.env` from `.env.example`.
2. Set `OPENAI_ADMIN_KEY` when possible. `OPENAI_API_KEY` is used as a fallback.
3. In VSCode, run `Tasks: Run Task`.
4. Select `OpenAI: watch costs`.

Commands:

```powershell
npm.cmd run usage:costs
npm.cmd run usage:watch
```

Notes:

- This uses the OpenAI Costs API.
- It shows API costs, not ChatGPT subscription message limits.
- The task refreshes every 5 minutes by default.
