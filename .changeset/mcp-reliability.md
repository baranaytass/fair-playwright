---
'fair-playwright': patch
---

Fix MCP server integration, which did not work as documented.

**The documented install command was wrong.** Every example showed
`npx fair-playwright-mcp`, but `fair-playwright-mcp` is a bin name, not a package
name, so npm resolved it as a package and returned 404. All docs, the README and
the CLI's own `--help` output now use `npx -p fair-playwright fair-playwright-mcp`.

**The server served stale results.** Results were loaded only when nothing had
been loaded yet, so the file was read once per process and never again. An AI
assistant that ran tests, fixed code and re-ran them kept seeing the first run's
results — breaking the exact loop the server exists for. Results are now re-read
whenever the file's mtime or size changes.

**Failures were silent.** A missing or malformed results file produced an empty
result set with no explanation. Tools and resources now return a message saying
what is wrong and how to fix it, including the `output: { json: true }` reporter
setting that produces the file.

**`results-path` accepts a directory.** The docs described
`FAIR_PLAYWRIGHT_RESULTS` as a directory while the code used it as a file path.
Both now work; a directory is resolved to `results.json` inside it.

**JSON output turns itself on when MCP is wired up.** `output.json` defaults to
`false`, but the MCP server needs that file. When `FAIR_PLAYWRIGHT_RESULTS` is
set, the reporter now writes JSON to that path automatically.

**The handshake reported the wrong version.** `serverInfo.version` was hard-coded
to `0.1.0`; it is now read from package.json.
