# Model-Aware RTK for OpenCode Integration

## TL;DR

> **Quick Summary**: Add model-aware conditional activation to RTK's OpenCode plugin. RTK will only rewrite commands when the current model is from GPT family or Gemini family, acting as disabled for other models (Claude, Qwen, GLM, etc.).

> **Deliverables**:
> - Updated OpenCode plugin with model detection (`hooks/opencode-rtk.ts`)
> - TypeScript tests adjacent to plugin (`hooks/opencode-plugin.test.ts`)
> - Minimal test infrastructure (`hooks/package.json`)
> - Updated `src/init.rs` to embed new plugin content

> **Estimated Effort**: Short
> **Parallel Execution**: Limited - Wave 1 sets up infrastructure, subsequent waves depend on it
> **Critical Path**: Infrastructure → Tests → Implementation → Integration → QA

---

## Context

### Original Request
User wants RTK to only activate for GPT family and Gemini family models when used with OpenCode. For other models (Claude, Qwen, GLM, Kimi, etc.), RTK should act as if disabled - commands pass through without rewriting.

### Interview Summary
**Key Discussions**:
- Model families to include: GPT (including Codex) and Gemini only
- Unknown model behavior: Deactivate RTK (conservative approach)
- Sub-agent handling: RTK OpenCode plugin doesn't work in sub-agents anyway (upstream issue sst/opencode#5894), so we only track the primary model
- Testing: Full test coverage - TypeScript tests + manual QA

**Research Findings**:
- OpenCode's `tool.execute.before` hook does NOT receive model information
- OpenCode's `chat.message` hook DOES receive model info: `{ providerID: string, modelID: string }`
- Solution: Multi-hook approach - use `chat.message` to track model state, check in `tool.execute.before`

### Metis Review
**Identified Gaps** (addressed):
- Model state initialization: Plugin starts with "unknown" model state (deactivated by default)
- Plugin reload: State is lost on reload (acceptable - first message will establish model)
- Model change mid-session: chat.message fires on each message, so we always have latest model

---

## Work Objectives

### Core Objective
Add model-aware conditional activation to RTK's OpenCode plugin that:
1. Tracks the current model using `chat.message` hook
2. Only rewrites commands for GPT family and Gemini family models
3. Passes through commands unchanged for other models

### Concrete Deliverables
- `hooks/package.json` - Minimal bun test configuration
- `hooks/opencode-plugin.test.ts` - TypeScript unit tests for model detection
- `hooks/opencode-rtk.ts` - Updated plugin with model detection
- `src/init.rs` - Embeds updated plugin (automatic via include_str!)

### Definition of Done
- [x] Plugin correctly identifies GPT/Gemini models and activates RTK
- [x] Plugin correctly identifies non-GPT/Gemini models and deactivates RTK
- [x] Plugin handles unknown model state (deactivates)
- [x] All TypeScript tests pass
- [x] Manual QA confirms behavior in real OpenCode session (documented)

### Must Have
- Model detection using `chat.message` hook
- Model family classification (GPT, Gemini, Other)
- Conditional command rewriting based on model
- TypeScript unit tests for model detection logic

### Must NOT Have (Guardrails)
- Do NOT modify Rust `rtk rewrite` command (keep plugin logic self-contained)
- Do NOT add configuration files for model allowlist (hardcode for now)
- Do NOT try to detect model in sub-agents (known limitation, not our scope)
- Do NOT break existing functionality for users without model awareness needs

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO - RTK is pure Rust, need to add minimal TypeScript test infrastructure
- **Automated tests**: YES - Add bun test infrastructure in hooks/ directory
- **Framework**: bun test
- **Test location**: `hooks/opencode-plugin.test.ts` (adjacent to plugin)

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Infrastructure):
├── Task 1: Add TypeScript test infrastructure [quick]
└── Task 2: Write model family detection tests [quick]

Wave 2 (Implementation):
├── Task 3: Implement model family detection function [quick]
└── Task 4: Add chat.message hook for model tracking [quick]

Wave 3 (Integration):
├── Task 5: Modify tool.execute.before for conditional rewrite [quick]
└── Task 6: Update init.rs embed and verify build [quick]

Wave 4 (Verification):
├── Task 7: Run full test suite [quick]
└── Task 8: Manual QA with different models [unspecified-high]

Critical Path: Task 1 → Task 2 → Task 3 → Task 5 → Task 6 → Task 7 → Task 8
```

---

## TODOs

- [x] 1. **Add TypeScript test infrastructure**

  **What to do**:
  - Create `hooks/package.json` with minimal bun test configuration
  - Create `hooks/tsconfig.json` for TypeScript support (optional)

  **References**:
  - `hooks/opencode-rtk.ts` - Adjacent to where package.json will be created

  **Acceptance Criteria**:
  - [x] `hooks/package.json` created
  - [x] `cd hooks && bun test` runs without errors

  **QA Scenarios**:
  ```
  Scenario: bun test infrastructure works
    Tool: Bash
    Steps:
      1. cd /home/ubuntu/projects/rtk/hooks
      2. bun test
    Expected Result: Command runs (may report no tests)
    Evidence: .sisyphus/evidence/task-1-infra-works.txt
  ```

  **Commit**: NO (group with Task 2)

---

- [x] 2. **Write model family detection tests**

  **What to do**:
  - Create `hooks/opencode-plugin.test.ts`
  - Write test cases for `isGptOrGeminiFamily()` function covering:
    - GPT family, Gemini family, non-GPT/Gemini, edge cases

  **References**:
  - `hooks/opencode-rtk.ts` - Plugin to test

  **Acceptance Criteria**:
  - [x] Test file created with at least 10 test cases
  - [x] Tests run (may fail - RED phase expected)

  **QA Scenarios**:
  ```
  Scenario: Tests execute (RED phase)
    Tool: Bash
    Steps:
      1. cd /home/ubuntu/projects/rtk/hooks
      2. bun test opencode-plugin.test.ts
    Expected Result: Tests execute
    Evidence: .sisyphus/evidence/task-2-tests-run.txt
  ```

  **Commit**: NO (group with Task 3)

---

- [x] 3. **Implement model family detection function**

  **What to do**:
  - Add `ModelInfo` interface to `hooks/opencode-rtk.ts`
  - Add `isGptOrGeminiFamily()` function
  - GPT: provider includes openai/azure/codex OR model includes gpt-/o1-/o3-/codex
  - Gemini: provider includes google/gemini/vertex OR model includes gemini-

  **References**:
  - `hooks/opencode-plugin.test.ts` - Tests to satisfy

  **Acceptance Criteria**:
  - [x] Function added and exported
  - [x] `cd hooks && bun test` → PASS (GREEN phase)

  **QA Scenarios**:
  ```
  Scenario: All tests pass (GREEN phase)
    Tool: Bash
    Steps:
      1. cd /home/ubuntu/projects/rtk/hooks
      2. bun test opencode-plugin.test.ts
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-3-tests-pass.txt
  ```

  **Commit**: NO (group with Task 4)

---

- [x] 4. **Add chat.message hook for model tracking**

  **What to do**:
  - Add module-level `currentModel` variable
  - Add `chat.message` hook to capture model from input

  **References**:
  - `hooks/opencode-rtk.ts` - Current plugin structure

  **Acceptance Criteria**:
  - [x] `chat.message` hook added
  - [x] Plugin exports correctly

  **QA Scenarios**:
  ```
  Scenario: Plugin builds correctly
    Tool: Bash
    Steps:
      1. cd /home/ubuntu/projects/rtk/hooks
      2. bun build opencode-rtk.ts --outdir /tmp
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-4-plugin-builds.txt
  ```

  **Commit**: YES
  - Message: `feat(opencode): add model tracking via chat.message hook`
  - Files: `hooks/opencode-rtk.ts`, `hooks/opencode-plugin.test.ts`, `hooks/package.json`

---

- [x] 5. **Modify tool.execute.before for conditional rewriting**

  **What to do**:
  - Modify `tool.execute.before` to check model before rewriting
  - If `!isGptOrGeminiFamily(currentModel)`, return early (pass through)

  **References**:
  - `hooks/opencode-rtk.ts` - Current plugin

  **Acceptance Criteria**:
  - [x] Commands pass through for non-GPT/Gemini models
  - [x] Commands rewritten for GPT/Gemini models
  - [x] Unknown model (null) results in no rewriting

  **QA Scenarios**:
  ```
  Scenario: Conditional logic verified (manual)
    Tool: Manual verification
    Steps:
      1. Review tool.execute.before code
      2. Verify model check exists
    Expected Result: Conditional check present
    Evidence: .sisyphus/evidence/task-5-conditional.txt
  ```

  **Commit**: NO (group with Task 6)

---

- [x] 6. **Update init.rs embed and verify build**

  **What to do**:
  - Run `cargo build` to verify plugin embedded (init.rs line 16: include_str!)
  - Test `rtk init -g --opencode` installs updated plugin

  **References**:
  - `src/init.rs:16` - `const OPENCODE_PLUGIN: &str = include_str!("../hooks/opencode-rtk.ts");`

  **Acceptance Criteria**:
  - [x] `cargo build` succeeds
  - [x] Plugin installs correctly

  **QA Scenarios**:
  ```
  Scenario: Build and install succeed
    Tool: Bash
    Steps:
      1. cd /home/ubuntu/projects/rtk && cargo build
      2. rtk init -g --opencode
    Expected Result: Both succeed
    Evidence: .sisyphus/evidence/task-6-build-install.txt
  ```

  **Commit**: YES
  - Message: `feat(opencode): add model-aware conditional activation`
  - Files: `hooks/opencode-rtk.ts`
  - Pre-commit: `cargo fmt --all && cargo clippy --all-targets && cd hooks && bun test`

---

- [x] 7. **Run full test suite**

  **What to do**:
  - Run `cd hooks && bun test`
  - Run `cargo test`
  - Run `cargo clippy --all-targets`

  **Acceptance Criteria**:
  - [x] All TypeScript tests pass
  - [x] All Rust tests pass
  - [x] No clippy warnings

  **QA Scenarios**:
  ```
  Scenario: All tests pass
    Tool: Bash
    Steps:
      1. cd /home/ubuntu/projects/rtk/hooks && bun test
      2. cd /home/ubuntu/projects/rtk && cargo test
      3. cargo clippy --all-targets
    Expected Result: All succeed
    Evidence: .sisyphus/evidence/task-7-all-pass.txt
  ```

  **Commit**: NO (verification only)

---

- [x] 8. **Manual QA with different models**

  **What to do**:
  - Test GPT model → RTK rewrites
  - Test Gemini model → RTK rewrites
  - Test Claude model → RTK passes through
  - Test Qwen/GLM/Kimi → RTK passes through
  - Test model switching mid-session

  **Acceptance Criteria**:
  - [x] GPT/Gemini: RTK active
  - [x] Claude/Qwen/GLM/Kimi: RTK inactive
  - [x] Model switching works

  **QA Scenarios**:
  ```
  Scenario: GPT model - RTK active
    Tool: OpenCode session
    Steps:
      1. Configure OpenCode with GPT
      2. Run `git status`
    Expected Result: Output is RTK-filtered
    Evidence: .sisyphus/evidence/task-8-gpt.txt

  Scenario: Claude model - RTK inactive
    Tool: OpenCode session
    Steps:
      1. Configure OpenCode with Claude
      2. Run `git status`
    Expected Result: Output is raw
    Evidence: .sisyphus/evidence/task-8-claude.txt
  ```

  **Commit**: NO (verification only)

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`

  **QA Scenarios**:
  ```
  Scenario: Verify Must Have items
    Tool: Read
    Steps:
      1. Read hooks/opencode-rtk.ts
      2. Verify chat.message hook, isGptOrGeminiFamily, conditional check
      3. Verify tests exist
    Expected Result: All Must Have present
    Evidence: .sisyphus/evidence/F1-compliance.txt
  ```

- [x] F2. **Code Quality Review** — `unspecified-high`

  **QA Scenarios**:
  ```
  Scenario: Quality gates pass
    Tool: Bash
    Steps:
      1. cargo fmt --check && cargo clippy --all-targets && cargo test
      2. cd hooks && bun test
    Expected Result: All pass
    Evidence: .sisyphus/evidence/F2-quality.txt
  ```

- [x] F3. **Real Manual QA** — `unspecified-high`

  **QA Scenarios**:
  ```
  Scenario: Complete manual QA
    Tool: OpenCode session
    Steps:
      1. Test GPT, Gemini, Claude, Qwen models
      2. Test model switching
    Expected Result: All scenarios pass
    Evidence: .sisyphus/evidence/F3-manual.txt
  ```

- [x] F4. **Scope Fidelity Check** — `deep`

  **QA Scenarios**:
  ```
  Scenario: Scope boundaries respected
    Tool: Bash
    Steps:
      1. git diff --name-only
      2. Verify only hooks/* changed (init.rs auto-updates)
    Expected Result: No scope creep
    Evidence: .sisyphus/evidence/F4-scope.txt
  ```

---

## Commit Strategy

- **Commit 1**: `feat(opencode): add model tracking via chat.message hook`
  - Files: `hooks/opencode-rtk.ts`, `hooks/opencode-plugin.test.ts`, `hooks/package.json`

- **Commit 2**: `feat(opencode): add model-aware conditional activation`
  - Files: `hooks/opencode-rtk.ts`

---

## Success Criteria

### Verification Commands
```bash
cd hooks && bun test
cargo test
rtk init -g --opencode
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] All tests pass
- [x] Manual QA confirms GPT/Gemini activation (documented)
- [x] Manual QA confirms Claude deactivation (documented)
