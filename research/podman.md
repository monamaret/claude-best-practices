# Podman as a sandbox for Claude Code: research notes

Not published. Hugo publishes only `content/` and `static/`. Collected on 2026-10-27 for a possible Podman section on `content/docs/general-tips/sandboxes.md`. The owner deferred that section. None of these commands have been tested. Verify every fact against the linked sources before you use it.


## Conclusions
- Docker Sandboxes (sbx) cannot use Podman. sbx needs a hypervisor (Windows Hypervisor Platform), not a container runtime. Sources: https://docs.docker.com/ai/sandboxes/install/ and /architecture/
- The Claude Code docs allow a "Custom container" ("any Docker or OCI container image with your own network policies, mounted volumes, and seccomp profiles") on https://code.claude.com/docs/en/sandbox-environments. Podman is not named there. The page has a checklist: writable mounts, reachable credentials, and allowed egress.
- On https://code.claude.com/docs/en/devcontainer, the warning is that with --dangerously-skip-permissions a container "does not prevent a malicious project from exfiltrating anything accessible inside the container, including the Claude Code credentials stored in ~/.claude". Do not mount ~/.ssh or cloud credentials. The CLI rejects the flag when it runs as root. Use the flag only together with network egress restrictions.
- No public official Anthropic container image exists. The devcontainer feature ghcr.io/anthropics/devcontainer-features/claude-code:1.0 does exist. The reference .devcontainer (node:20 plus an init-firewall.sh iptables allowlist that needs NET_ADMIN and NET_RAW) is "a working example rather than a maintained base image". Its allowlist may not include claude.ai or platform.claude.com, which subscription OAuth needs (unverified).

## Recommended stance for the page
- Podman is a third, weaker option: a rootless container that shares the kernel of the podman machine VM. Its network has full egress by default, with no built-in domain allowlist. The OAuth token in the volume is readable by the agent.
- Recommend Podman for keeping tools and dependencies off the host, and for limiting writes to the mounted workspace, while you keep normal permission modes (Manual, Plan, or Edit automatically).
- Do NOT recommend --dangerously-skip-permissions or bypassPermissions in the Podman setup that the page documents, because it has no egress restriction. Say that this needs a network allowlist, which the page does not cover.
- Mark the setup as not yet tested by the guide authors only if needed. Better: keep the instructions minimal and accurate, and list open questions in the report.

## Install
- Windows:
  - Windows 11, with hardware virtualization enabled.
  - The WSL 2 backend (the default) or Hyper-V (Enterprise, Pro, or Education, and the Hyper-V Administrators group).
  - The Podman MSI installer: user scope is the default and needs no admin rights. Run `wsl --install` first if WSL is missing.
  - Run `podman machine init`, then `podman machine start`.
  - Rootless is the default.
  - With WSL, the --cpus and --memory machine settings apply only to Hyper-V.
  - Podman Desktop: `winget install RedHat.Podman-Desktop`. Its onboarding installs Podman.
  - Sources:
    - https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md
    - https://docs.podman.io/en/latest/markdown/podman-machine.1.html
    - https://podman-desktop.io/docs/installation/windows-install
- macOS:
  - The pkg installer is recommended. Homebrew is "not recommended".
  - Run `podman machine init` and `podman machine start`, then `podman info`.
  - The machine mounts $HOME by default, so projects outside $HOME need -v at init.
  - Source: https://podman.io/docs/installation

## Run (NOT TESTED)
Containerfile:
```dockerfile
FROM docker.io/library/debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git \
 && rm -rf /var/lib/apt/lists/* \
 && useradd -m -u 1000 -s /bin/bash dev \
 && mkdir -p /workspace && chown dev:dev /workspace
USER dev
WORKDIR /home/dev
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH=/home/dev/.local/bin:$PATH \
    CLAUDE_CONFIG_DIR=/home/dev/.claude \
    DISABLE_AUTOUPDATER=1
WORKDIR /workspace
```
- Set a WORKDIR before you run the installer; running it from / hangs (troubleshoot-install).
- Build: `podman build -t claude-sandbox .`
- Create the volume: `podman volume create claude-config`

Windows PowerShell:
```powershell
podman run --rm -it --name claude-sandbox `
  --userns=keep-id:uid=1000,gid=1000 `
  --cap-drop=all --security-opt no-new-privileges `
  --memory 4g --cpus 2 --pids-limit 1024 `
  -v claude-config:/home/dev/.claude:U `
  -v "${PWD}:/workspace" -w /workspace `
  localhost/claude-sandbox claude
```
macOS: the same command with bash line continuations and "$PWD". The project must be under $HOME.

Notes:
- Never put :U on the workspace mount, because it chowns the host files.
- On a Linux host with SELinux, add :Z to the workspace mount. Not needed on Windows or macOS (unverified).
- OAuth: the CLI prints a URL. Copy it (the `c` clipboard key probably does not reach the host), complete SSO in the host browser, and paste the code at `Paste code here if prompted` (authentication and troubleshoot-install pages). Egress to claude.ai, claude.com, platform.claude.com, and sso.claude.com is needed (network-config).
- Updates: DISABLE_AUTOUPDATER is set because --rm loses updates. Rebuild the image to update.
- Windows performance: a bind mount from C:\ goes through /mnt/c in the WSL machine and is slow. For large repositories, clone inside the machine (https://learn.microsoft.com/en-us/windows/wsl/filesystems). Line endings: use .gitattributes with `*.sh text eol=lf`.
- devcontainer.json with Podman: VS Code supports Podman 5+ through the `dev.containers.dockerPath` setting set to "podman" (https://code.visualstudio.com/remote/advancedcontainers/docker-options). Optional; this is unverified on Windows and macOS. Mention it in one sentence at most.

## Security comparison
- Kernel: Podman shares the kernel of the machine VM. On WSL, all WSL 2 distributions share one kernel and network namespace. Docker Sandboxes uses a separate kernel per sandbox.
- After an escape: from Podman, the attacker reaches the machine, which on WSL has every Windows drive at /mnt/c and on macOS has $HOME mounted. Docker Sandboxes reaches only what you shared explicitly.
- Credentials: in Podman, the token is in the volume and the agent can read it. In Docker Sandboxes, the token stays on the host and a proxy injects it.
- Network: Podman gives full egress by default. Docker Sandboxes uses a deny-by-default proxy with policies.
- Workspace: both bind-mount the workspace writable.
