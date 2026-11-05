---
title: "Sandboxes"
weight: 60
description: >-
  Run the Claude Code CLI in a Docker sandbox, so that Claude works with fewer permission prompts and limited access to your computer.
---

A sandbox is a boundary around the work that Claude does. Inside the boundary, Claude can edit files, install packages, and run commands. Outside it, Claude has limited access to your files, credentials, and network. A sandbox matters most when Claude works with fewer permission prompts, because then the boundary protects your computer instead of your approvals.

This page covers two options. The built-in sandbox of Claude Code isolates the shell commands that Claude runs. [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/) runs the whole Claude Code CLI in a separate microVM on your computer. Most of this page describes Docker Sandboxes, because it is the option that works on native Windows. Isolation does not change what Claude Code sends to the model: your prompts and the files that Claude reads still go to Anthropic.

Docker Sandboxes runs the Claude Code CLI. Claude Desktop can connect to a Docker sandbox as an SSH session, but that connection sends your Anthropic credentials into the Docker sandbox. The procedures on this page use the CLI. To install the CLI, see [Install and configure the CLI](/docs/cli/install-and-configure).

## Concepts

| Term | Meaning |
| --- | --- |
| Built-in sandbox | The sandboxing of shell commands that Claude Code does itself, with the security features of the operating system |
| Docker sandbox | A microVM on your computer that Docker Sandboxes creates for one agent. It persists until you remove it. |
| Agent | The program that runs in a Docker sandbox. This page uses the `claude` agent, which is Claude Code. |
| Workspace | The directory on your computer that a Docker sandbox mounts. In direct mode, the agent edits it in place. In clone mode, the agent works on a private Git clone. A mountless Docker sandbox has no workspace. |
| Policy | The rules for network access. Local rules apply to all Docker sandboxes on your computer, or to one of them. Organization policies can also control which host paths a Docker sandbox can mount. |
| Secret | A credential that the host-side proxy adds to requests from a Docker sandbox. The Docker sandbox sees only a placeholder value. |
| Published port | A port in a Docker sandbox that you make available on your computer, so that your browser can reach an app |
| Template | A saved image of the file system of a Docker sandbox. Use it to create new Docker sandboxes with the same tools. |
| Local or cloud sandbox | A local Docker sandbox runs on your computer. A cloud sandbox runs on Docker infrastructure and has a cost. This guide covers local Docker sandboxes only. |

## Choose between the built-in sandbox and Docker Sandboxes

The two options put the boundary in different places. The built-in sandbox wraps each shell command. Docker Sandboxes wraps the Claude Code process and everything that it starts. This section assumes that both run on your own computer.

### Compare the two options

| | Built-in sandbox | Docker Sandboxes |
| --- | --- | --- |
| Boundary | Bash, PowerShell, and Monitor tool commands, and the processes that they start | The whole Claude Code process, inside a microVM |
| Outside the boundary | Claude Code itself. The file tools (Read, Edit, Write) and web tools, which permission rules control instead. Hooks, MCP servers, and LSP servers. | The host-side proxy, and local MCP servers that you register with `sbx mcp add`, which run on your computer |
| Isolation technology | Seatbelt on macOS. bubblewrap on Linux and WSL 2. | A microVM with its own Linux kernel, file system, network, and Docker Engine |
| File system | Writes go only to the working directory, a temporary directory, and directories that you add. Reads reach most of your computer, including `~/.ssh`, unless you deny them. | Only the workspace that you mount, and a shared store for skills. The rest of your computer is not visible. |
| Network | A proxy allows only the domains in your settings. The list is empty at the start. | A proxy on your computer applies a network policy to all outbound TCP traffic |
| Credentials | Commands inherit the environment variables of Claude Code, and can read credential files that you do not deny | A proxy adds stored credentials to outbound requests. The values do not enter the Docker sandbox. SSH agent forwarding is enabled by default. |
| Platforms | macOS, Linux, and WSL 2. Not native Windows. | Windows 11 on x64, macOS 14 or later on Apple silicon, and Ubuntu 24.04 or later |
| Setup | Run `/sandbox`. On Linux and WSL 2, install `bubblewrap` and `socat`. | Install the `sbx` CLI, sign in to Docker, and initialize a network policy |
| Resource use | No extra virtual machine | One microVM for each running Docker sandbox, with its own disk, memory, and Docker images |

For the details, see [Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing) and the Docker Sandboxes [Security model](https://docs.docker.com/ai/sandboxes/security/).

### Advantages and disadvantages

The following table compares how each option handles the common risks on a local computer and everyday development tasks.

| Topic | Built-in sandbox | Docker Sandboxes |
| --- | --- | --- |
| A destructive command | A write outside the working directory fails. A command can still delete files inside the working directory. | The command changes only the microVM and the workspace. In clone mode, your repository is mounted read-only. |
| Data sent out after a prompt injection | Shell commands reach only the allowed domains. Web tools and MCP servers are outside the boundary, so only permission rules control them. | The policy applies to all outbound TCP traffic. The **Balanced** preset includes broad wildcards, which can still allow data to leave. |
| Exposed credentials | A command can read `~/.ssh` and `~/.aws` unless you deny them in the `sandbox.credentials` setting | Files outside the workspace are not visible. A `.env` file inside the workspace is visible. With SSH agent forwarding, processes can use your SSH keys. |
| Tools installed on your computer | An install that writes outside the working directory fails | Packages, images, and containers stay in the microVM. Removing the Docker sandbox removes them. |
| IDE, `/ide`, and diffs | Your IDE, `/ide`, and the IDE diff view work as usual | Edit and diff the workspace files on your computer, or connect VS Code to the Docker sandbox over SSH |
| Changes in your files | Edits appear in your working tree | Direct mode: edits appear at once. Clone mode: edits stay in the Docker sandbox until you fetch them with Git. |
| A local app | On macOS, a server that a sandboxed command starts needs `sandbox.network.allowLocalBinding`. On Linux and WSL 2, your browser cannot reach that server. | Publish a port with `sbx ports`. The app must listen on `0.0.0.0`. |
| Toolchain | Uses your JDK, .NET SDK, and build tools. Writes to caches such as `~/.m2` and `~/.gradle` need `sandbox.filesystem.allowWrite`. Downloads need `allowedDomains`. Docker commands do not work. | Uses a Linux toolchain that you install in the Docker sandbox. Caches start empty in each Docker sandbox. Each Docker sandbox has its own Docker Engine. |
| Reproducibility | Commit the `sandbox` settings in `.claude/settings.json`. Administrators can enforce them with managed settings. | Share templates and environment files. Organization policies need a separate Docker subscription. |
| Fewer permission prompts | Auto-allow mode approves commands that run in the built-in sandbox. File edits still follow the permission mode. | Claude Code starts with `--dangerously-skip-permissions` by default. The microVM is the isolation that this mode requires. |

The Claude Code documentation allows `bypassPermissions` mode and `--dangerously-skip-permissions` only in an isolated container or virtual machine, or in the sandbox runtime. The built-in sandbox alone does not meet this condition, because the file tools, hooks, and MCP servers stay outside it. The documentation also recommends an environment without internet access for this mode. Docker Sandboxes applies a network policy instead, so choose the policy carefully. See [Skip all checks with bypassPermissions mode](https://code.claude.com/docs/en/permission-modes#skip-all-checks-with-bypasspermissions-mode).

### Use both together

You can use the two layers together:

- **Docker Sandboxes protects your computer.** The microVM limits what Claude Code, its hooks, and its MCP servers can reach.
- **Permission rules still apply inside a Docker sandbox.** Claude Code reads the project settings in the workspace. A deny rule blocks a tool in every mode, including `bypassPermissions`. Your user settings files in `~/.claude` stay on your computer and do not apply.
- **The built-in sandbox can also run inside a Docker sandbox.** This combination is not tested for this guide. Run `/sandbox` in the session: a **Dependencies** tab lists the packages that are missing.

The built-in sandbox inside a Docker sandbox has these costs:

- Each Docker sandbox needs `bubblewrap` and `socat`. Install them one time, and save the result as a template.
- Docker commands do not work in the built-in sandbox. To let Claude use the private Docker Engine, add the Docker commands to `excludedCommands`.
- You get more permission prompts, because the built-in sandbox asks before it allows a new domain.
- If bubblewrap fails to start, the documented fix is `enableWeakerNestedSandbox`. It weakens the built-in sandbox, so the documentation allows it only when an outer boundary isolates the session. The microVM is that boundary. See [Bubblewrap fails to start inside a container](https://code.claude.com/docs/en/sandboxing#bubblewrap-fails-to-start-inside-a-container).

See [How isolation relates to permission modes](https://code.claude.com/docs/en/sandbox-environments#how-isolation-relates-to-permission-modes).

### Recommendation

- **Native Windows:** The built-in sandbox is not available. Use Docker Sandboxes for repositories that you did not write, plugins that you have not reviewed, long autonomous runs, and permission modes with fewer prompts. Use clone mode for a repository that you did not write. A Docker sandbox runs Linux, so Windows-only builds cannot run there, for example .NET Framework, MSBuild targets for Windows, and Windows PowerShell scripts. For those projects, use **Manual** mode or auto mode with the permission rules in [Settings files](/docs/general-tips/settings-file). For the built-in sandbox, run the CLI in WSL 2.
- **macOS or WSL 2:** Use the built-in sandbox for everyday work in your own repositories. Use Docker Sandboxes for repositories that you did not write, plugins that you have not reviewed, long autonomous runs, and permission modes with fewer prompts.

## Install and configure Docker Sandboxes

{{< callout type="important" >}}
On Windows, one step needs administrator rights. Docker Sandboxes also needs a Docker account. Your organization can require that you sign in with an account in its Docker organization. Ask your administrators which account to use before you sign in.
{{< /callout >}}

The `sbx` CLI and local Docker sandboxes are free to use, including for commercial work. You do not need Docker Desktop or Docker Engine. Organization governance, such as central policies and sign-in enforcement, is a separate paid Docker subscription. See the [Docker Sandboxes FAQ](https://docs.docker.com/ai/sandboxes/faq/).

{{% steps %}}

### Check the requirements

{{< tabs >}}
{{< tab name="Windows" >}}
- Windows 11
- A 64-bit Intel or AMD processor
- The **Windows Hypervisor Platform** feature. Docker Sandboxes does not need WSL 2 or Docker Desktop.

If your computer is a virtual machine or a virtual desktop, it must support nested virtualization.
{{< /tab >}}
{{< tab name="macOS" >}}
- macOS Sonoma 14 or later
- Apple silicon
{{< /tab >}}
{{< /tabs >}}

If your network restricts outbound traffic, your firewall must allow the Docker domains in [Which domains do I need to allow](https://docs.docker.com/ai/sandboxes/faq/#which-domains-do-i-need-to-allow-for-docker-sandboxes-to-work).

### Install the sbx CLI

{{< tabs >}}
{{< tab name="Windows" >}}
1. Open PowerShell as an administrator, and enable Windows Hypervisor Platform with the following command. If Windows asks you to restart, restart the computer.

   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform -All
   ```

2. Open PowerShell as your normal user, and run the following command:

   ```powershell
   winget install -h Docker.sbx
   ```

   WinGet installs `sbx` for your user in `%LOCALAPPDATA%\DockerSandboxes` and adds it to your user PATH. This step does not need administrator rights.

3. Open a new PowerShell window, so that it reads the updated PATH.

Your administrators can also install `sbx` for all users with an MSI package. See [Install for all users](https://docs.docker.com/ai/sandboxes/install/#install-for-all-users).

If your repository is in a WSL distribution, clone mode can fail with a Git ownership error. See [Clone mode reports "not in a Git repository" on WSL](https://docs.docker.com/ai/sandboxes/troubleshooting/#clone-mode-reports-not-in-a-git-repository-on-wsl).
{{< /tab >}}
{{< tab name="macOS" >}}
Run the following commands:

```shell
brew trust docker/tap
brew install docker/tap/sbx
```
{{< /tab >}}
{{< /tabs >}}

To confirm the installation, run the following command. It prints the version of the CLI.

```shell
sbx version
```

### Sign in to Docker

Run the following command:

```shell
sbx login
```

The command opens a browser for the Docker sign-in. Use the account that your administrators named. If your organization enforces sign-in, an account outside the organization is refused.

### Initialize the network policy

Run the following command before your first Docker sandbox:

```shell
sbx policy init balanced
```

The **Balanced** preset blocks traffic by default, and allows AI provider APIs, package managers, code hosts, container registries, and common cloud services. A request to another host asks for your approval. The other presets are `allow-all` (**Open**) and `deny-all` (**Locked Down**). Initialization is a one-time step. To change the preset later, run `sbx policy reset`, which also stops running Docker sandboxes.

To show the rules that apply, run the following command:

```shell
sbx policy ls
```

If the output starts with `Governance: Managed by` and an organization name, your organization manages the policy. Your local allow rules then have no effect, but your local deny rules still apply.

### Disable SSH agent forwarding (optional)

SSH agent forwarding is enabled by default. Your private keys stay on your computer. But any process in a Docker sandbox can ask your SSH agent to use the keys that it holds. A process can then sign data, authenticate to the SSH hosts that the policy allows, push to repositories, and sign commits as you. On Windows, Docker Sandboxes uses the Windows OpenSSH agent pipe when `SSH_AUTH_SOCK` is not set.

If you do not need SSH in Docker sandboxes, disable forwarding and restart the daemon:

```shell
sbx settings set ssh.agentForwardingEnabled false
sbx daemon restart
```

### Check the installation

Run the following command:

```shell
sbx diagnose
```

The command checks the CLI, the daemon, the storage directories, and your Docker sign-in. It reports each problem that it finds. If you need help, see [Troubleshooting](https://docs.docker.com/ai/sandboxes/troubleshooting/).

{{% /steps %}}

## Run Claude Code in a Docker sandbox

### Start the first session

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Claude Desktop does not start Docker sandboxes. It can connect to an existing Docker sandbox as an SSH session, and this sends your Anthropic credentials into the Docker sandbox. See [Connect Claude Desktop to a sandbox](https://docs.docker.com/ai/sandboxes/integrations/claude-desktop/).
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
1. Open a terminal in the root of your repository.
2. Run the following command:

   ```shell
   sbx run --name <SANDBOX_NAME> claude
   ```

   `<SANDBOX_NAME>` is a name that you choose, for example the name of the repository. If you omit `--name`, the name is `claude-` followed by the directory name. The first run downloads the agent image, so it takes longer than later runs.
3. Claude Code starts inside the Docker sandbox. Sign in as described in the next section.

To confirm the Docker sandbox, open a second terminal and run the following command:

```shell
sbx ls
```

The output is similar to the following:

```text
SANDBOX      AGENT    STATUS      PORTS   WORKSPACE      CREATED
my-sandbox   claude   ● running           ~/my-project   2m
```
{{< /tab >}}
{{< /tabs >}}

### Sign in with Claude Enterprise

Claude Code uses your Claude Enterprise sign-in in the Docker sandbox. You do not need an API key.

1. If Claude Code does not show the sign-in screen, run `/login` in the session.
2. Complete the sign-in as described in [Sign in with Claude Enterprise](/docs/cli/install-and-configure#sign-in-with-claude-enterprise). Open the sign-in URL in the browser on your computer, and complete the SSO sign-in there. If the browser shows a code, paste it into the session.
3. Run `/status`. Confirm that the account and organization are your Claude Enterprise account and organization, and check which managed settings sources apply.

Docker Sandboxes keeps the session token on your computer. It does not store the token in the Docker sandbox. A proxy on your computer adds the token to the requests that Claude Code sends to Anthropic.

Managed settings reach a Docker sandbox in only one way:

- **Server-managed settings** from the Claude Enterprise admin console are fetched by Claude Code after you sign in, so they apply in the Docker sandbox.
- **Endpoint-managed settings** on your computer, from device management, the Windows registry, or a `managed-settings.json` file, do not reach the microVM.

Do not store an Anthropic API key with `sbx secret set anthropic` unless your administrators tell you to. When an API key and a sign-in are both available, the API key takes precedence. A Console API key belongs to a Claude Console organization, so usage is billed to that organization. Claude Code then applies the managed settings of that organization, not of your Claude Enterprise organization. The `sbx secret import` command also reads `ANTHROPIC_API_KEY` from your environment, so decline that entry when it asks. See [Claude Code in Docker Sandboxes](https://docs.docker.com/ai/sandboxes/agents/claude-code/).

### Control the permission mode

Without arguments, `sbx run` starts Claude Code with `--dangerously-skip-permissions`. Claude does not ask before it edits files or runs commands. A `permissions.defaultMode` value in the project settings does not change this, because the command-line flag has a higher priority.

You can switch to **Manual** mode in the session with `Shift+Tab`. The change applies to the current session only, and each new `sbx run` starts in bypass mode again. While bypass mode is available, plan mode does not block edits or commands, and Claude Code does not check protected paths. Do not rely on plan mode in this session.

To start Claude Code without the bypass flag, use one of these options:

- **Start a session with `sbx exec`.** This command does not add the default flag. Run it in a second terminal while the Docker sandbox runs:

  ```shell
  sbx exec -it <SANDBOX_NAME> -- claude --permission-mode default
  ```

  Replace `default` with `auto` to use [auto mode](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode), where a classifier reviews each action.
- **Use a custom kit.** A kit that extends the built-in agent can change its launch options. See [Why do agents run without approval prompts?](https://docs.docker.com/ai/sandboxes/faq/#why-do-agents-run-without-approval-prompts)
- **Disable bypass mode in the settings.** Set `permissions.disableBypassPermissionsMode` to `"disable"` in the project or local settings of the repository. Claude Code then rejects the default launch flag. If your administrators deliver this setting in server-managed settings, Claude Code also rejects the flag.

{{< callout type="warning" >}}
In bypass mode and in direct mode, Claude can change every file in the workspace without a prompt. This includes files that run without an explicit command: Git hooks, CI configuration, build scripts, and `.claude/` settings. It also includes `.git/config` and `.gitattributes`. Settings such as `core.fsmonitor`, `core.hooksPath`, and diff or filter drivers run commands on your computer when you run `git status` or `git diff`. After a session in direct mode, read `.git/config` and `.gitattributes` in an editor before you run Git. In clone mode, `.git/config` on your computer stays unchanged.
{{< /callout >}}

### What a Docker sandbox can see

- **The workspace.** The Docker sandbox mounts the current directory read-write. The agent and your computer see the same files. To mount another directory read-only, add it with `:ro`:

  ```shell
  sbx run claude . <DOCS_DIR>:ro
  ```

  `<DOCS_DIR>` is the path of a directory that Claude must read but not change, for example shared documentation.
- **Project configuration.** The CLAUDE.md files, `.claude/settings.json`, skills, and hooks in the workspace apply in the Docker sandbox. Claude Code saves the approvals that you give in the Docker sandbox to `.claude/settings.local.json` in the workspace, so they also apply on your computer.
- **Not your user settings files.** Your user settings, user CLAUDE.md file, and hooks in `~/.claude` stay on your computer. Put the rules that must apply in the Docker sandbox in the project settings. See [Settings files](/docs/general-tips/settings-file).
- **The network that the policy allows.** To show the requests that the policy blocked, run the following command:

  ```shell
  sbx policy log
  ```

- **The credentials that you provide.** A Docker sandbox has no credentials unless you store them with `sbx secret set` or pass environment variables. SSH agent forwarding is the exception: it is enabled by default.

Git ignore rules do not limit what the agent can read in the workspace. A `.env` file in the workspace is visible in the Docker sandbox.

### How changes return to your files

The workspace mode decides when Claude's changes reach your working tree. Choose the mode when you create the Docker sandbox. You cannot change it later.

| Mode | Command | When changes appear on your computer |
| --- | --- | --- |
| Direct (default) | `sbx run claude` | At once, in your working tree |
| Clone | `sbx run --clone claude .` | After you fetch the branch from the `sandbox-<SANDBOX_NAME>` Git remote |
| Mountless | `sbx create --name <SANDBOX_NAME> claude` | After the agent pushes a branch to a remote repository |

Direct mode suits focused work on one branch. In this mode, you and the agent share the working tree. Agree on who switches branches and creates commits, because a branch switch changes the files for both. Clone mode suits a repository that you did not write, because your repository and its `.git/config` stay read-only. For clone mode, parallel tasks, and worktrees, see [Use Git with sandboxes](https://docs.docker.com/ai/sandboxes/workflows/git/).

## Develop and test locally

Each Docker sandbox has a full Linux environment with `sudo` and a private Docker Engine. Claude can install packages, start databases and containers, and run the test suite there. Containers that the agent starts do not appear in `docker ps` on your computer.

### Build and run the tests in a Docker sandbox

A Docker sandbox does not have your toolchain at the start. Ask Claude to install the tools that the build needs, and to run the build and the tests. See [Prepare a Docker sandbox to build and test this repository](/docs/prompts/project-setup#prepare-a-docker-sandbox-to-build-and-test-this-repository). Installed packages persist until you remove the Docker sandbox.

To run a command in the Docker sandbox yourself, open a second terminal and run the following command:

```shell
sbx exec <SANDBOX_NAME> -- <TEST_COMMAND>
```

`<TEST_COMMAND>` is your test command, for example `mvn test`. The command runs in the workspace and returns the exit code of the test command.

To open a shell in the Docker sandbox, run the following command:

```shell
sbx exec -it <SANDBOX_NAME> -- bash
```

If a download fails, the network policy probably blocks the host. Run `sbx policy log` to find the host, and then allow it:

```shell
sbx policy allow network <HOST>
```

To allow the host for one Docker sandbox only, add `--sandbox <SANDBOX_NAME>`.

### Open a local app through a published port

Your browser cannot reach a server in a Docker sandbox until you publish its port. The server must listen on all interfaces in the Docker sandbox, not only on `127.0.0.1`. For most development servers, start them with an option such as `--host 0.0.0.0`.

To publish sandbox port `3000` on port `8080` on your computer, run the following command:

```shell
sbx ports <SANDBOX_NAME> --publish 8080:3000
```

Open `http://localhost:8080` in your browser. To list the published ports, run the following command:

```shell
sbx ports <SANDBOX_NAME>
```

To stop forwarding, run `sbx ports` with `--unpublish 8080:3000`. If you know the port when you create the Docker sandbox, pass `--publish 8080:3000` to `sbx run` instead.

### Reach a service on your computer

From a Docker sandbox, use the host name `host.docker.internal` instead of `localhost` or `127.0.0.1`. Allow the port in the policy first. For example, for a service on port `5432`, run the following command:

```shell
sbx policy allow network localhost:5432
```

See [Develop and test locally](https://docs.docker.com/ai/sandboxes/workflows/development/).

## Develop in a Docker sandbox

### Work in a terminal

A Docker sandbox persists after Claude Code exits. To continue later, run the following command from any directory:

```shell
sbx run --name <SANDBOX_NAME>
```

The Claude Code version in a Docker sandbox comes from the agent image. Updating `sbx` does not update Claude Code in an existing Docker sandbox. To update it, run the following command and restart the session:

```shell
sbx exec <SANDBOX_NAME> -- claude update
```

### Work with your IDE

In direct mode, open the workspace in your IDE on your computer as usual. Claude's edits appear in your editor, and you review them in the Git diff. For the IDE integration of the CLI, see [CLI and IDE](/docs/cli/cli-and-ide).

To run VS Code inside the Docker sandbox, connect it with the Remote - SSH extension. On Windows, install the OpenSSH client first.

1. Run the following command one time. The `setup` command is experimental.

   ```shell
   sbx setup ssh
   ```

2. In VS Code, run **Remote-SSH: Connect to Host...**, and enter `<SANDBOX_NAME>.sbx`.
3. Open the workspace folder. To find its path, run `ssh <SANDBOX_NAME>.sbx` in a terminal, and then run `pwd`. An SSH shell starts in the workspace. You can also browse to the folder in the remote folder picker.

See [Connect VS Code to a sandbox](https://docs.docker.com/ai/sandboxes/integrations/vscode/).

### Manage the lifecycle of a Docker sandbox

A Docker sandbox uses disk space until you remove it. Remove the Docker sandboxes that you do not use.

| Task | Command |
| --- | --- |
| Stop a Docker sandbox and keep its state | `sbx stop <SANDBOX_NAME>` |
| Remove a Docker sandbox | `sbx rm <SANDBOX_NAME>` |
| Show the stopped Docker sandboxes that `prune` removes | `sbx prune --dry-run` |
| Remove all stopped Docker sandboxes | `sbx prune` |
| Remove the Docker sandbox when the session ends | `sbx run --rm claude` |

Removing a Docker sandbox deletes everything inside it: packages, Docker images, and the clone in clone mode. Files in a direct-mounted workspace stay on your computer. In clone mode, fetch or push the commits that you want to keep first. The `rm` and `prune` commands ask for confirmation.

## Reuse and automate workflows

### Save a template

Install the toolchain in a Docker sandbox one time, and save the result as a template. New Docker sandboxes from the template start with the same tools.

1. Stop the Docker sandbox:

   ```shell
   sbx stop <SANDBOX_NAME>
   ```

2. Save the template:

   ```shell
   sbx template save <SANDBOX_NAME> <TEMPLATE_NAME>:<TAG>
   ```

3. Create a Docker sandbox from the template:

   ```shell
   sbx run --pull never -t <TEMPLATE_NAME>:<TAG> claude
   ```

`<TEMPLATE_NAME>:<TAG>` is a name and version that you choose, for example `java-build:v1`. To share a template, add `--output <FILE>.tar` to `sbx template save`. A teammate then loads it with `sbx template load <FILE>.tar`. A template contains the files in the file system of the Docker sandbox, including any credential that someone saved there. It does not contain the workspace or Claude Code's user configuration.

### Declare the environment in a file

An environment file, `sbxenv.yaml`, describes a Docker sandbox in YAML: the agent, the workspace, environment variables, resources, and ports. Each developer can start the same Docker sandbox with one command. The `sbx env` command and the file format are experimental and can change.

Docker recommends that you keep the file outside every directory that the Docker sandbox mounts, next to the repository:

```text
<ENV_DIR>/
├── sbxenv.yaml
└── <REPOSITORY_DIR>/
```

The following file mounts the repository as the workspace:

```yaml {filename="<ENV_DIR>/sbxenv.yaml"}
schemaVersion: "1"
name: <SANDBOX_NAME>
agent: claude
workspace: ./<REPOSITORY_DIR>

env:
  APP_PROFILE: sandbox

sandboxOptions:
  cpus: 4
  memory: 8g

ports:
  - sandbox: 3000
    host: 8080
```

- `<ENV_DIR>` is a directory that holds the environment file and the repository.
- `<REPOSITORY_DIR>` is the directory of the repository. `<SANDBOX_NAME>` is the name of the Docker sandbox.
- `env` sets variables that are not secret. Replace `APP_PROFILE` with the variables that your project needs.
- `ports` publishes sandbox port `3000` on port `8080` on your computer.

To see what the file changes before you apply it, run the following command in `<ENV_DIR>`:

```shell
sbx env plan
```

To create the Docker sandbox and attach, run the following command in the same directory. It shows the plan and asks for your approval.

```shell
sbx env run
```

An environment file can declare lifecycle, secret, and MCP commands, and these commands run on your computer with your permissions. As an exception, you can commit the file at the root of the repository and set `workspace: .`. `sbx` then mounts the file read-only, so the agent cannot change it. Do not put the file in a subdirectory of the workspace. Review each change to the file as you review code. See [Review an sbxenv.yaml file before you run it](/docs/prompts/review#review-an-sbxenvyaml-file-before-you-run-it) and [Sandbox environment files](https://docs.docker.com/ai/sandboxes/configuration/environment-files/).

### Share policies and secrets in a team

- **Policies.** Local policy rules apply only to your computer. Write the hosts that the project needs in the README, with the `sbx policy allow network` command for each host. For rules that apply to every developer, your Docker administrators can use [Organization policies](https://docs.docker.com/ai/sandboxes/governance/access-controls/organization/).
- **Secrets.** Each developer stores their own secrets with `sbx secret set`. In an environment file, read a secret from a command or a vault reference, never from a literal value. For example, `command: gh auth token` reads the GitHub token of your GitHub CLI. See [Manage credentials](https://docs.docker.com/ai/sandboxes/configuration/credentials/).

### Run a task without attaching

To run one bounded task in a Docker sandbox from a script, call `claude -p` through `sbx exec`. The command runs in the workspace and does not add the default `--dangerously-skip-permissions` flag. Pass the permissions that the task needs:

```shell
sbx exec <SANDBOX_NAME> -- claude -p "<PROMPT>" --permission-mode dontAsk --allowedTools "Read,Edit,Bash(<TEST_COMMAND> *)" --max-turns 20
```

A Docker sandbox runs Linux, so Claude uses the Bash tool there, and Bash rules are enough. For the flags, the output formats, and the exit codes, see [Non-interactive mode](/docs/cli/non-interactive-mode).

This guide covers runs on your own computer. The use of Claude Code in CI/CD pipelines is still under review, and that includes Docker sandboxes on a CI runner. See [CI/CD and repository automation](/docs/cli/non-interactive-mode#cicd-and-repository-automation).

## Good practice

- **Start with the Balanced preset, and allow only what the project needs.** Run `sbx policy ls` and remove the default rules that you do not need, such as broad wildcards. Use `--sandbox <SANDBOX_NAME>` for a rule that only one project needs.
- **Disable SSH agent forwarding if you do not need it.** Any process in a Docker sandbox can use the keys in your SSH agent, including to push and to sign commits as you. See [Disable SSH agent forwarding (optional)](#disable-ssh-agent-forwarding-optional).
- **Keep secrets out of templates and files.** Store credentials with `sbx secret set`, so that the proxy adds them to requests. A credential that you write into the file system of a Docker sandbox is saved in each template that you create from it.
- **Check the Git configuration before you run Git.** After a session in direct mode, read `.git/config` and `.gitattributes` in an editor, and check `.git/hooks/`. Then read the complete `git diff`, and run the tests yourself. See [Review the changes from a sandbox session before you commit](/docs/prompts/review#review-the-changes-from-a-sandbox-session-before-you-commit).
- **Use clone mode when the agent works without supervision for a long time.** Your working tree stays unchanged until you fetch the agent's branch.
- **Review plugins before you install them, also in a Docker sandbox.** See [Review a plugin before you install it](/docs/cli/plugins#review-a-plugin-before-you-install-it).
- **Remove the Docker sandboxes that you do not use.** Run `sbx ls` regularly, and remove old Docker sandboxes with `sbx rm` or `sbx prune`.
- **Check the resources that Docker sandboxes use.** A Docker sandbox can use all CPUs and up to half of your memory by default. Its root file system can grow to 20 GB, and its Docker data to 10 GB. Docker sandboxes do not share images. Limit a Docker sandbox with `--cpus` and `--memory` when you create it.
- **Check your Claude usage.** A session in a Docker sandbox counts toward your Claude Enterprise allowance, the same as on your computer. See [Check usage and cost](/docs/cli/common-tasks#check-usage-and-cost).
- **Do not use cloud sandboxes.** The `--cloud` flag runs sandboxes on Docker infrastructure, which has a cost and sends your files to the cloud. This guide covers local Docker sandboxes only.

## Related prompts

- [Prepare a Docker sandbox to build and test this repository](/docs/prompts/project-setup#prepare-a-docker-sandbox-to-build-and-test-this-repository)
- [Review the changes from a sandbox session before you commit](/docs/prompts/review#review-the-changes-from-a-sandbox-session-before-you-commit)
- [Review an sbxenv.yaml file before you run it](/docs/prompts/review#review-an-sbxenvyaml-file-before-you-run-it)

## Further reading

- [Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing)
- [Choose a sandbox environment](https://code.claude.com/docs/en/sandbox-environments)
- [Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Server-managed settings](https://code.claude.com/docs/en/server-managed-settings)
- [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/), including [Install Docker Sandboxes](https://docs.docker.com/ai/sandboxes/install/), [Usage](https://docs.docker.com/ai/sandboxes/usage/), and [Workflow patterns](https://docs.docker.com/ai/sandboxes/workflows/)
- [Docker Sandboxes security model](https://docs.docker.com/ai/sandboxes/security/) and [Architecture](https://docs.docker.com/ai/sandboxes/architecture/)
- [Local policy](https://docs.docker.com/ai/sandboxes/governance/access-controls/local/)
- [Settings files](/docs/general-tips/settings-file), [Non-interactive mode](/docs/cli/non-interactive-mode), [Hooks](/docs/cli/hooks), and [Install and configure the CLI](/docs/cli/install-and-configure) in this guide
