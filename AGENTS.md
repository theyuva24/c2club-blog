# Global AI Safety, Intelligence & Quality Protocol

These rules apply globally to ALL AI assistants, IDEs (Antigravity, Cursor, Windsurf, Claude Code, Copilot, VS Code), and subagents working in this workspace.

---

## 1. Zero Terminal Prompts for File/Directory Exploration
- **Do NOT run terminal shell commands** (`powershell`, `bash`, `dir`, `Get-ChildItem`, `ls`, `cat`, `find`) for standard file searching, reading, or directory browsing.
- **ALWAYS use native IDE / Agent tools** (`list_dir`, `view_file`, `grep_search`, `read_file`) for file inspection. Native tools execute instantly inside the agent environment without triggering unnecessary permission popups or prompt fatigue.

---

## 2. Mandatory Explicit Warning Before Destructive / State-Altering Commands
- **NEVER** execute or propose destructive commands (`git reset`, `git clean`, `git checkout -- .`, `git branch -D`, `rm -rf`, `Remove-Item`, `del /s`, `git push --force`, database drops) silently or alongside routine safe commands.
- **BEFORE** proposing any state-altering or destructive command, the AI **MUST** write an explicit, bold warning box in the chat containing:
  1. 🚨 **DESTRUCTIVE ACTION WARNING**: State clearly what command is about to run.
  2. ⚠️ **EXACT IMPACT**: List precisely what files, untracked changes, commits, or data will be permanently discarded or modified.
  3. 🛡️ **SAFE ALTERNATIVE**: Suggest a safe fallback first (e.g., `git stash`, committing changes to a temporary branch, or taking a manual backup).
- The AI must wait for the user to review the warning before triggering execution.

---

## 3. Strict Secrets & Credential Protection
- **NEVER** print, log, output, or commit secret keys, API tokens, `.env` variables, Firebase service account credentials (`.json`/`.p12`), or database passwords.
- Always redact sensitive values if reading environment or configuration files.

---

## 4. Empirical Log-Driven Debugging (No Guesswork or Masking)
- **NEVER** guess the cause of a build failure, crash, or lint error without reading the complete, un-truncated error log.
- **NO Silent Symptom Masking**: Never resolve an error by wrapping broken code in empty `try/catch` blocks, returning dummy 0/null fallbacks, commenting out broken assertions, or deleting failing tests. Identify and fix the true root cause.

---

## 5. Verification Integrity (Never Declare Success Early)
- **NEVER** claim a task is complete, a bug is fixed, or a refactor is working until you run empirical verification (`flutter analyze`, `npm test`, `tsc --noEmit`, etc.) showing 0 errors.
- Always report exact verification results to the user.

---

## 6. Pre-Refactor Git Safety Checks & Utility Re-use
- **Git Safety**: Before conducting large multi-file edits, inspect `git status`. If dirty untracked work exists, suggest a quick commit or `git stash` to preserve a restore point.
- **Audit Before Re-inventing**: Always search the codebase (`grep_search`) for existing utility functions, data models, or reusable UI components before creating new ones from scratch.
