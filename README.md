# Maks' Pi setup

A public, **sanitized snapshot** of my [Pi coding agent](https://pi.dev/) setup on Windows. It contains the settings, model overrides, keybindings, locally maintained extensions, a patched Herdr subagent extension, and one locally maintained skill. Other third-party packages and skills are **referenced, not vendored**. No credentials, chat history, or personal memory are published.

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
  herdr-subagents/        # patched upstream Herdr subagent package and tests
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
| [`modem-dev/pi-herdr-subagents`](https://github.com/modem-dev/pi-herdr-subagents) | Locally vendored at [`extensions/herdr-subagents`](extensions/herdr-subagents/README.md), based on `2489019` with Windows launch and pane cleanup fixes |
| [`penniey/pi-paste-image`](https://github.com/penniey/pi-paste-image) | Image paste (local checkout at `3b332d6` when exported) |

Npm and Git package declarations are unpinned in `settings.json`; the accompanying npm lockfile records the installed npm dependency snapshot. The Herdr package is different: its patched source is included here and settings point to a local copy, so a fresh install retains these fixes. The remaining Git commit ID documents the observed local checkout, **not** a pin in settings. Herdr is based on upstream MIT-licensed source with attribution retained in its README.

### Skills

| Skill | Source / role |
| --- | --- |
| [`tsk-cli`](skills/tsk-cli/SKILL.md) | Included locally maintained skill: operate and refine the `tsk` task board via CLI; requires [tsk](https://gettsk.sh/docs/install.md). |
| `babysit-pr` | [timschoch/skilly](https://github.com/timschoch/skilly), `bundles/workflow/skills/babysit-pr`: watch PR CI and review threads. |
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills), `skills/find-skills`: discover installable skills. |
| `skill-creator` | [anthropics/skills](https://github.com/anthropics/skills), `skills/skill-creator`: create and evaluate skills. |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design): visual design guidance (matching upstream identified by its contents; not in the local skill lockfile). |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): searchable UI/UX design guidance (matching upstream identified by its description; not in the local skill lockfile). |

## Clone this Pi setup (Windows / PowerShell)

Install [Pi](https://pi.dev/) (this snapshot used **1.4.0**), Git, Node.js/npm and, if you want Herdr subagents, [Herdr](https://github.com/modem-dev/herdr). Run the following in **PowerShell**, not Git Bash, on a fresh profile. **Read the repository and upstream skill/package code before installing**: Pi extensions and skills can execute code or direct an agent to do so. If you already have a Pi setup, back up `~/.pi/agent` and `~/.agents/skills` first; the config copies below overwrite matching files.

```powershell
git clone https://github.com/MakCoder-2004/pi-maks-version.git "$HOME\pi-maks-version"
$repo = Join-Path $HOME 'pi-maks-version'
$agent = Join-Path $HOME '.pi\agent'
$skills = Join-Path $HOME '.agents\skills'
New-Item -ItemType Directory -Force $agent, (Join-Path $agent 'extensions'), (Join-Path $agent 'packages'), $skills | Out-Null

# Pi settings, model overrides, keybindings and plan-mode shortcut.
'settings.json', 'models.json', 'keybindings.json', 'pi-plan-mode.jsonc' | ForEach-Object {
    Copy-Item (Join-Path $repo "agent\$_") -Destination $agent -Force
}

# Locally maintained extensions and skill.
'memory', 'workflow' | ForEach-Object {
    Copy-Item (Join-Path $repo "extensions\$_") -Destination (Join-Path $agent 'extensions') -Recurse -Force
}
Copy-Item (Join-Path $repo 'skills\tsk-cli') -Destination $skills -Recurse -Force
Copy-Item (Join-Path $repo 'extensions\herdr-subagents') -Destination (Join-Path $agent 'packages') -Recurse -Force
npm ci --omit=dev --prefix (Join-Path $agent 'extensions\workflow')

# Install the 9 npm and 1 Git package; the local Herdr package was copied above.
pi update --extensions

# Optional: start Herdr in another terminal, then link its included dispatcher.
# (Skip this command if you do not use Herdr.)
herdr plugin link (Join-Path $agent 'packages\herdr-subagents\herdr-plugin')

# Install all five referenced third-party skills globally for Pi only.
npx --yes skills add timschoch/skilly -g -a pi -s babysit-pr -y
npx --yes skills add vercel-labs/skills -g -a pi -s find-skills -y
npx --yes skills add anthropics/skills -g -a pi -s skill-creator -y
npx --yes skills add anthropics/skills -g -a pi -s frontend-design -y
npx --yes skills add nextlevelbuilder/ui-ux-pro-max-skill -g -a pi -s ui-ux-pro-max -y

# Verify package/skill discovery, then launch and sign in to your own provider.
pi list
npx --yes skills list -g -a pi
pi
```

**Result:** four personal config files, two custom extensions, one patched local Herdr package, the `tsk-cli` skill, 11 Pi packages (9 npm, 1 Git, 1 local), and five upstream skills. Pi discovers `~/.agents/skills` automatically. `tsk-cli` also needs the separate [tsk CLI](https://gettsk.sh/docs/install.md). The UI/UX skill's search scripts may need Python 3. The remaining Git checkout is unpinned, so the package command installs its current upstream version, not necessarily the commit listed above. Likewise upstream skills may have changed since this snapshot.

## Restore notes

The settings are sanitized (the machine `deviceId` was removed). Change the default model/provider if your account lacks it, then authenticate privately in Pi. No API credentials, sessions or memory can be restored from this public repository. The npm lockfile in `package-manifest/` records installed dependencies but is **not** a Pi config file; the workflow extension's own `package-lock.json` is used by `npm ci`. Do not copy `node_modules` into Git.

Start `pi` and check startup warnings and the loaded resource list; use `/reload` after later config changes. To use subagents, run `pi` inside a Herdr-managed pane after linking the included plugin; running Pi outside Herdr only offers setup hints. The workflow extension's [`DEPLOYMENT.md`](extensions/workflow/DEPLOYMENT.md) lists optional release checks. Its operator-owned `~/.pi/SPECS.md` and `~/.pi/workflows/pipeline.yaml` were **not present** at export time; [`pipeline.example.yaml`](extensions/workflow/pipeline.example.yaml) is only an example, not an active workflow. The historical `AUDIT.md` was omitted because it described a different machine and referred to unexported private paths. The original skill-lock metadata was omitted because it included unrelated agent selections and machine-local installation records.

The exported workflow tests were adjusted to use a local example and temporary fixtures instead of private operator files. On Windows with Bun 1.4.2: **40 pass, 3 skipped, 0 fail**; three child-process error-path cases are skipped because their fixture does not reliably deliver pipe/close events to Bun on Windows. Run `bun test extensions/workflow/tests` after installing `yaml` and making the Pi runtime packages resolvable to Bun.

## Privacy and limits

This is **not** a byte-for-byte backup of the agent directory. Deliberately excluded: `auth.json` and any OAuth/API tokens, sessions/transcripts, user/global/project memory contents, caches, machine IDs, downloaded Pi runtime/binaries, generated `node_modules`, and other third-party package/skill source. The included Herdr package is the explicitly vendored exception. A user MCP configuration exists but is intentionally excluded; there are no prompt templates or themes in this snapshot. The repository's [`.gitignore`](.gitignore) blocks common private/runtime paths, but review every future commit before making it public. Third-party components remain governed by their upstream licenses.
