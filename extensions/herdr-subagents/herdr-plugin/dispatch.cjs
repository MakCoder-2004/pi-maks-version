// Herdr starts this with Node so Windows never resolves bare `bash` to WSL's
// C:\Windows\System32\bash.exe. Run the existing Bash dispatcher with Git Bash.
const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join, delimiter } = require("node:path");

function resolveBash(env = process.env, platform = process.platform) {
  if (platform !== "win32") return env.PI_HERDR_BASH_BIN || "bash";

  const candidates = [
    env.PI_HERDR_BASH_BIN,
    env.ProgramFiles && join(env.ProgramFiles, "Git", "bin", "bash.exe"),
    env["ProgramFiles(x86)"] && join(env["ProgramFiles(x86)"], "Git", "bin", "bash.exe"),
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Programs", "Git", "bin", "bash.exe"),
    ...(env.PATH || "").split(delimiter)
      .filter((dir) => /[/\\]git[/\\](?:bin|usr[/\\]bin)$/i.test(dir))
      .map((dir) => join(dir, "bash.exe")),
  ];
  const bash = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!bash) {
    throw new Error("Git Bash not found. Install Git for Windows or set PI_HERDR_BASH_BIN to its bash.exe path.");
  }
  return bash;
}

function main() {
  const root = process.env.HERDR_PLUGIN_ROOT;
  if (!root) throw new Error("HERDR_PLUGIN_ROOT is missing");
  const bash = resolveBash();
  const child = spawn(bash, [join(root, "dispatch.sh")], { stdio: "inherit" });
  child.on("error", (err) => {
    console.error(`pi-herdr-subagents: could not launch Git Bash: ${err.message}`);
    process.exitCode = 127;
  });
  child.on("exit", (code, signal) => {
    process.exitCode = code ?? (signal ? 128 : 1);
  });
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`pi-herdr-subagents: ${err.message}`);
    process.exitCode = 127;
  }
}

module.exports = { resolveBash, main };
