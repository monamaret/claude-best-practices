---
title: "Extend with MCP"
weight: 20
description: >-
  Connect Claude to tools and data with MCP servers, and understand the limits.
tags:
  - under-review
---

The Model Context Protocol (MCP) is an open standard for connecting an AI application to external systems. An MCP server exposes tools, and sometimes resources, from a system that Claude Code does not reach on its own. Examples are an issue tracker, a database, or a browser. Connecting a server adds its tools to the session, in the same way as Claude's built-in tools. Claude can then call them during a task, instead of only reading about the system secondhand.

## Add an MCP server

An MCP server connects over one of a few transports. One kind is a local command that Claude Code runs and talks to over standard input and output. The other is a URL that Claude Code calls over HTTP or SSE. Which one you use depends on how the server is distributed. A server that you run yourself is usually the local kind, and a hosted server is usually a URL.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
1. Select **Customize** > **Connectors**.
2. Add the MCP server from this screen, following the flow for the kind of server that you are adding.

<!-- SCREENSHOT: Claude Desktop, Customize > Connectors screen, showing the control to add a new connector. Use a sample server with no internal names. -->

Desktop's MCP server configuration, which the UI calls **Connectors**, is separate from the Claude Code CLI's. Adding a server in Desktop does not add it to the CLI, and the reverse is also true.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
Add a server with `claude mcp add`, naming a scope so Claude Code knows who the server is for and where to save it:

```shell
# A server you run locally, over standard input and output
claude mcp add <NAME> -- <COMMAND>

# A hosted server, over HTTP
claude mcp add --transport http --scope project <NAME> <URL>
```

| Scope | Where it is saved | Who it applies to |
| --- | --- | --- |
| `local` (default) | Your user configuration, for this project only | Only you, only in this project |
| `project` | `.mcp.json` at the repository root | Everyone who clones the repository |
| `user` | Your user configuration | Only you, in every project |

Commit a `project`-scope server so that your team gets the same setup. A teammate who clones the repository still has to approve a project-scoped server before Claude Code connects to it; see [Security considerations](#security-considerations).

Manage servers with `claude mcp list`, `claude mcp get <NAME>`, and `claude mcp remove <NAME>`. If you already use Claude Desktop, `claude mcp add-from-claude-desktop` imports its MCP servers into the CLI on macOS and WSL.
{{< /tab >}}
{{< /tabs >}}

{{< callout type="info" >}}
To send a specific piece of data from an MCP server into context, without connecting the whole server as a tool provider, @-mention it: `@server:protocol://resource/path`. See [Use MCP resources](https://code.claude.com/docs/en/mcp#use-mcp-resources).
{{< /callout >}}

## Limits: context cost, permissions, and reliability

**Context cost.** Every connected server's tool definitions load into context on every turn, whether or not the task uses them. See [What fills the context window](/docs/general-tips/context#what-fills-the-context-window). Disconnect a server that you are not using for the current task; see [Remove context that is not useful](/docs/general-tips/context#remove-context-that-is-not-useful).

**Permissions.** An MCP tool call goes through the same permission system as any other tool call, so your permission mode and `permissions.ask` and `permissions.deny` rules apply to it. A server added at `project` scope needs your explicit approval the first time, so that cloning a repository cannot connect you to a server you have not agreed to. Run `/mcp` in a session to see each server's status and approve one that is pending.

**Reliability.** A remote server can be slow or unavailable. Claude Code retries a failed call a limited number of times, then gives up and reports the failure, rather than retrying indefinitely. A call that runs long moves to a background task instead of blocking the session. Treat an MCP tool as a call to a system that you do not control. It can fail or time out independently of anything Claude does, so expect Claude to report that failure rather than silently work around it. See [MCP](https://code.claude.com/docs/en/mcp) for the current timeout and retry behavior.

## Security considerations

Connecting a server that you have not reviewed is not a neutral default choice. A server that fetches external content, such as a page or a search result, can carry a prompt injection in that content. Claude reads the server's response in the same way as any other tool result. Connect only a server whose source and behavior you understand, in the same way as you would review a plugin before installing it. See [Review a plugin before you install it](/docs/prompts/review#review-a-plugin-before-you-install-it) for a plugin that bundles an MCP server, and [Protect against prompt injection](https://code.claude.com/docs/en/security#protect-against-prompt-injection) for the server case directly.

Scope credentials to what the task needs. If a server connects to a database, use a read-only account for it rather than one with write access, so that a mistake or a prompt injection cannot use the connection to change data. Claude Code does not echo a credential such as an API key or a token in its output; if you must reference one in a server's configuration, use an environment variable rather than a literal value in `.mcp.json`.

{{< callout type="important" >}}
A Claude Enterprise administrator can restrict which MCP servers connect at all, through a managed allowlist or denylist. A server blocked this way does not connect even if a project's `.mcp.json` lists it.
{{< /callout >}}

## Good practice

- Add a server at `project` scope only when the whole team needs it, and commit it so everyone gets the same setup.
- Disconnect a server that you are not using for the current task. Its tool names stay in context for as long as it is connected.
- Review a server's source before you connect it. Treat it as untrusted until you know what it fetches and what it does with the result.
- Use a read-only credential for a server that only needs to read data.

## Further reading

- [MCP](https://code.claude.com/docs/en/mcp)
- [MCP quickstart](https://code.claude.com/docs/en/mcp-quickstart)
- [Context](/docs/general-tips/context)
- [Plugins](/docs/cli/plugins)
