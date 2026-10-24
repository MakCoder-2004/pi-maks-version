import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const pluginDir = resolve("herdr-plugin");
const dispatcher = join(pluginDir, "dispatch.sh");
const { resolveBash } = createRequire(import.meta.url)(join(pluginDir, "dispatch.cjs"));

describe("Herdr plugin dispatcher", () => {
  it("declares the subagent and generic argv pane entrypoints", () => {
    const manifest = readFileSync(join(pluginDir, "herdr-plugin.toml"), "utf8").replaceAll("\r\n", "\n");
    assert.match(manifest, /^id = "pi-herdr-subagents"$/m);
    assert.match(manifest, /^version = "0\.2\.0"$/m);
    assert.match(manifest, /^min_herdr_version = "0\.8\.2"$/m);
    assert.match(manifest, /^platforms = \["linux", "macos", "windows"\]$/m);
    assert.match(manifest, /^id = "subagent"\ntitle = "Pi subagent"\nplacement = "split"$/m);
    assert.match(manifest, /^id = "argv"\ntitle = "Command"\nplacement = "split"$/m);
    assert.equal(
      manifest.match(
        /^command = \["node", "-e", "require\(process\.env\.HERDR_PLUGIN_ROOT \+ '\/dispatch\.cjs'\)\.main\(\)"\]$/gm,
      )?.length,
      2,
    );
  });

  it("chooses Git Bash over Windows' WSL bash.exe", { skip: process.platform !== "win32" }, () => {
    const bash = resolveBash({
      ProgramFiles: process.env.ProgramFiles,
      PATH: "C:\\Windows\\System32;C:\\Program Files\\Git\\bin",
    }, "win32");
    assert.match(bash, /[/\\]Git[/\\]bin[/\\]bash\.exe$/i);
  });

  it("runs the manifest's Node bootstrap with a Windows system-first PATH", { skip: process.platform !== "win32" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "pi-herdr-bootstrap-"));
    try {
      const launchScript = join(dir, "launch.sh");
      writeFileSync(launchScript, 'printf "bootstrap-ok\\n"\n');
      const result = spawnSync(process.execPath, ["-e", "require(process.env.HERDR_PLUGIN_ROOT + '/dispatch.cjs').main()"], {
        env: {
          ...process.env,
          HERDR_PLUGIN_ROOT: pluginDir,
          PI_HERDR_LAUNCH_SCRIPT: launchScript,
          PATH: `C:\\Windows\\System32;${process.env.PATH}`,
        },
        encoding: "utf8",
        timeout: 10000,
      });
      assert.equal(result.status, 0, result.stderr || result.error?.message);
      assert.equal(result.stdout, "bootstrap-ok\n");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails with exit 64 when neither launch script env var is set", () => {
    const result = spawnSync("bash", [dispatcher], { env: {}, encoding: "utf8" });
    assert.equal(result.status, 64);
    assert.match(result.stderr, /PI_HERDR_LAUNCH_SCRIPT/);
    assert.match(result.stderr, /legacy fallback PI_SUBAGENT_LAUNCH_SCRIPT/);
  });

  it("fails with exit 66 when the resolved launch script is unreadable", () => {
    const result = spawnSync("bash", [dispatcher], {
      env: { PI_HERDR_LAUNCH_SCRIPT: "/definitely/missing/launch.sh" },
      encoding: "utf8",
    });
    assert.equal(result.status, 66);
    assert.match(result.stderr, /PI_HERDR_LAUNCH_SCRIPT/);
    assert.match(result.stderr, /legacy fallback PI_SUBAGENT_LAUNCH_SCRIPT/);
    assert.match(result.stderr, /launch script is not readable/);
  });

  it("executes the canonical launch script with bash", () => {
    const dir = mkdtempSync(join(tmpdir(), "pi-herdr-dispatch-"));
    try {
      const launchScript = join(dir, "launch.sh");
      writeFileSync(launchScript, 'printf "canonical\\n"\nexit 7\n');
      const result = spawnSync("bash", [dispatcher], {
        env: { PI_HERDR_LAUNCH_SCRIPT: launchScript },
        encoding: "utf8",
      });
      assert.equal(result.status, 7);
      assert.equal(result.stdout, "canonical\n");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("falls back to the legacy launch script when the canonical var is unset or empty", () => {
    const dir = mkdtempSync(join(tmpdir(), "pi-herdr-dispatch-"));
    try {
      const launchScript = join(dir, "launch.sh");
      writeFileSync(launchScript, 'printf "legacy\\n"\nexit 8\n');

      const legacyOnly = spawnSync("bash", [dispatcher], {
        env: { PI_SUBAGENT_LAUNCH_SCRIPT: launchScript },
        encoding: "utf8",
      });
      assert.equal(legacyOnly.status, 8);
      assert.equal(legacyOnly.stdout, "legacy\n");

      const emptyCanonical = spawnSync("bash", [dispatcher], {
        env: {
          PI_HERDR_LAUNCH_SCRIPT: "",
          PI_SUBAGENT_LAUNCH_SCRIPT: launchScript,
        },
        encoding: "utf8",
      });
      assert.equal(emptyCanonical.status, 8);
      assert.equal(emptyCanonical.stdout, "legacy\n");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prefers the canonical launch script when both vars are set", () => {
    const dir = mkdtempSync(join(tmpdir(), "pi-herdr-dispatch-"));
    try {
      const canonicalScript = join(dir, "canonical.sh");
      const legacyScript = join(dir, "legacy.sh");
      writeFileSync(canonicalScript, 'printf "canonical\\n"\n');
      writeFileSync(legacyScript, 'printf "legacy\\n"\n');
      const result = spawnSync("bash", [dispatcher], {
        env: {
          PI_HERDR_LAUNCH_SCRIPT: canonicalScript,
          PI_SUBAGENT_LAUNCH_SCRIPT: legacyScript,
        },
        encoding: "utf8",
      });
      assert.equal(result.status, 0);
      assert.equal(result.stdout, "canonical\n");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
