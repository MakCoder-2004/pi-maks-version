# Maks' Pi setup

A public, **sanitized snapshot** of my [Pi coding agent](https://pi.dev/) setup on Windows. It contains the settings, model overrides, keybindings, locally maintained extensions, and one locally maintained skill. Third-party packages and skills are **referenced, not vendored**. No credentials, chat history, or personal memory are published.

## At a glance

| Area | Configuration |
| --- | --- |
| Pi | Installed version **1.3.0** when exported |
| Default model | `openai-codex/gpt-6-luna`, **high** thinking |
| Model overrides | Seven `openai-codex` models (`gpt-5.6-luna/sol/terra`, `gpt-6-astra/luna/sol`, `gpt-6.1-sol`) use a 1,050,000-token context window and 128,000 max output tokens; see [`agent/models.json`](agent/models.json). Availability still depends on the provider/account. |
| Packages | 9 npm + 2 git sources declared in [`agent/settings.json`](agent/settings.json) |
| Local extensions | [`memory`](extensions/memory/README.md) and [`workflow`](extensions/workflow/DEPLOYMENT.md) |
| Skills | `tsk-cli` included; six other installed skills catalogued below without copied upstream files |
| Keybindings | Image paste binding cleared; plan-mode toggle `Ctrl+Alt+P` |
| MCP | `pi-mcp-adapter` installed; Pi's built-in MCP extension disabled. No user `mcp.json` was present in this snapshot. |

## Files

```text
agent/
  settings.json           # packages, default model, powerline, extension selection
  models.json             # provider model overrides
  keybindings.json        # image-paste shortcut override
  pi-plan-mode.jsonc      # plan-mode shortcut
extensions/
  memory/                 # persistent user/global/project memory tooling (code only)
  workflow/               # multi-phase workflow runner, tests and example YAML
skills/
  tsk-cli/SKILL.md        # locally maintained instructions for the tsk task board
package-manifest/
  package.json            # installed npm package versions/ranges
  package-lock.json       # npm dependency snapshot; no node_modules
```

### Installed Pi packages

| Source | Purpose |
| --- | --- |
| [`@juicesharp/rpiv-btw`](https://www.npmjs.com/package/@juicesharp/rpiv-btw) | Side questions / BTW interaction |
| [`pi-mcp-adapter`](https://www.npmjs.com/package/pi-mcp-adapter) | MCP integration in place of built-in MCP |
| [`@juicesharp/rpiv-ask-user-question`](https://www.npmjs.com/package/@juicesharp/rpiv-ask-user-question) | Structured clarification questions |
| [`@juicesharp/rpiv-todo`](https://www.npmjs.com/package/@juicesharp/rpiv-todo) | Agent task tracking |
| [`pi-goal-x`](https://www.npmjs.com/package/pi-goal-x) | Persistent goals |
| [`@baylarsadigov/omp-undo-redo`](https://www.npmjs.com/package/@baylarsadigov/omp-undo-redo) | Undo and redo |
| [`pi-web-access`](https://www.npmjs.com/package/pi-web-access) | Web research/access tools |
| [`pi-powerline-footer`](https://www.npmjs.com/package/pi-powerline-footer) | Footer/status line; default preset, qualified model and full context display |
| [`@milanglacier/pi-plan-mode`](https://www.npmjs.com/package/@milanglacier/pi-plan-mode) | Plan mode |
| [`modem-dev/pi-herdr-subagents`](https://github.com/modem-dev/pi-herdr-subagents) | Herdr subagents (local checkout at `b698732` when exported) |
| [`penniey/pi-paste-image`](https://github.com/penniey/pi-paste-image) | Image paste (local checkout at `3b332d6` when exported) |

The package declarations are unpinned in `settings.json`; the accompanying npm lockfile records the installed npm dependency snapshot. Git commit IDs above document the observed local checkouts, **not** pins in settings.

### Skills

| Skill | Source / role |
| --- | --- |
| [`tsk-cli`](skills/tsk-cli/SKILL.md) | Included locally maintained skill: operate and refine the `tsk` task board via CLI; requires [tsk](https://gettsk.sh/docs/install.md). |
| `babysit-pr` | [timschoch/skilly](https://github.com/timschoch/skilly), `bundles/workflow/skills/babysit-pr`: watch PR CI and review threads. |
| `code-review` | [mattpocock/skills](https://github.com/mattpocock/skills), `skills/engineering/code-review`: two-axis standards/spec review. |
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills), `skills/find-skills`: discover installable skills. |
| `skill-creator` | [anthropics/skills](https://github.com/anthropics/skills), `skills/skill-creator`: create and evaluate skills. |
| `frontend-design` | Installed locally: visual design guidance; upstream provenance was not recorded in the skill lockfile. |
| `ui-ux-pro-max` | Installed locally: searchable UI/UX design data and implementation guidelines; upstream provenance was not recorded in the skill lockfile. |

Three empty directories (`clean-code-guard`, `docs-guard`, `test-guard`) contained no `SKILL.md` or files, so they are not included or counted as working skills. Skills with documented upstream sources can be installed using the upstream instructions or `npx skills add <owner/repo@skill> -g -y`. For the two without recorded provenance, supply your own trusted copies after checking their origin and license.

## Restore (Windows)

1. Install [Pi](https://pi.dev/), Node.js/npm, and (for Herdr integration) [Herdr](https://github.com/modem-dev/herdr). **Review the code and third-party sources before loading extensions or skills.**
2. Copy `agent/settings.json`, `agent/models.json`, `agent/keybindings.json`, and `agent/pi-plan-mode.jsonc` into `%USERPROFILE%\.pi\agent\`. These are sanitized: the original machine `deviceId` was removed. If your Pi version requires it, Pi will regenerate local state. Adjust the default model/provider for your own account.
3. Copy `extensions/memory` and `extensions/workflow` into `%USERPROFILE%\.pi\agent\extensions\`. In a shell with npm, run `npm ci --omit=dev --prefix "$HOME/.pi/agent/extensions/workflow"` to install the workflow extension's pinned `yaml` dependency. Do not copy `node_modules` from this repository.
4. Copy `skills/tsk-cli` into `%USERPROFILE%\.agents\skills\`. Reinstall the referenced third-party skills from their maintainers if wanted. The original skill-lock metadata was not exported because it also contains unrelated agent selections and machine-local install records.
5. Let Pi reconcile the packages listed in `settings.json` (`pi update --extensions`), or install each declared source with `pi install <source>`. The npm lockfile under `package-manifest/` is a record of installed versions, **not** a Pi configuration file. Reauthenticate providers and any services privately; do not put keys into this repository.
6. Start `pi`, inspect loaded resources and warnings, and use `/reload` after subsequent config edits. The workflow extension's [`DEPLOYMENT.md`](extensions/workflow/DEPLOYMENT.md) lists its optional release checks. Its operator-owned `~/.pi/SPECS.md` and `~/.pi/workflows/pipeline.yaml` were **not present** at export time; [`pipeline.example.yaml`](extensions/workflow/pipeline.example.yaml) is only an example, not an active workflow. The historical `AUDIT.md` was omitted because it described a different machine and referred to unexported private paths.

The exported workflow tests were adjusted to use a local example and temporary fixtures instead of private operator files. On Windows with Bun 1.4.2: **40 pass, 3 skipped, 0 fail**; three child-process error-path cases are skipped because their fixture does not reliably deliver pipe/close events to Bun on Windows. Run `bun test extensions/workflow/tests` after installing `yaml` and making the Pi runtime packages resolvable to Bun.

## Privacy and limits

This is **not** a byte-for-byte backup of the agent directory. Deliberately excluded: `auth.json` and any OAuth/API tokens, sessions/transcripts, user/global/project memory contents, caches, machine IDs, downloaded Pi runtime/binaries, generated `node_modules`, and third-party package/skill source. There were no user `mcp.json`, prompt templates, or themes to export. The repository's [`.gitignore`](.gitignore) blocks common private/runtime paths, but review every future commit before making it public. Third-party components remain governed by their upstream licenses.
