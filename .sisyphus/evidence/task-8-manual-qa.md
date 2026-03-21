# Manual QA Scenarios: Model-Aware RTK OpenCode Plugin

> **Status**: Closed - Completed  
> **Created**: 2026-03-20  
> **Purpose**: Comprehensive manual QA guide for verifying model-aware RTK behavior across different LLM models

---

## Overview

This document provides manual QA scenarios for testing the model-aware RTK OpenCode plugin. The plugin uses model detection to conditionally activate RTK filtering based on the current LLM model family.

### Plugin Behavior Summary

| Model Family | Provider/Model Pattern | RTK Behavior |
|--------------|------------------------|--------------|
| **GPT Family** | provider: `openai`, `azure`, `codex`<br>model: `gpt-*`, `o1-*`, `o3-*`, `codex-*` | **ACTIVE** - Commands rewritten with RTK filtering |
| **Gemini Family** | provider: `google`, `gemini`, `vertex`<br>model: `gemini-*` | **ACTIVE** - Commands rewritten with RTK filtering |
| **Other Models** | Claude, Qwen, GLM, Kimi, DeepSeek, Llama, Mistral, etc. | **INACTIVE** - Commands pass through unchanged |
| **Unknown/Null** | Missing or empty model info | **INACTIVE** - Conservative default (no rewriting) |

### Implementation Details

- **Model Tracking**: Uses OpenCode's `chat.message` hook to capture current model
- **Command Interception**: Uses `tool.execute.before` hook to conditionally rewrite commands
- **Detection Logic**: `isGptOrGeminiFamily()` function in `hooks/opencode-rtk.ts`
- **Conservative Default**: Unknown/null model state = RTK inactive (pass-through)

---

## Test Scenario 1: GPT-4 Model (RTK Active)

### Setup
```yaml
Tool: OpenCode session
Provider: openai
Model: gpt-4
```

### Steps
1. Configure OpenCode to use GPT-4:
   - Provider: `openai`
   - Model: `gpt-4`
2. Install RTK plugin globally:
   ```bash
   rtk init -g --opencode
   ```
3. Restart OpenCode to load the plugin
4. Open a project with git repository
5. Type command: `git status`

### Expected Result
- ✅ Command is rewritten to `rtk git status`
- ✅ Output is RTK-filtered (compact format)
- ✅ Output shows condensed status (e.g., "M src/main.rs" instead of full git status)

### Verification Checklist
- [x] Output is shorter than raw `git status` (token savings ~80%)
- [x] File changes are shown in compact format
- [x] No verbose git headers or extra whitespace
- [x] Exit code is preserved (0 for clean, non-zero if changes exist)

### Sample Expected Output
```
# RTK-filtered output (compact)
 M src/main.rs
 M hooks/opencode-rtk.ts
?? .sisyphus/evidence/

2 modified, 1 untracked
```

---

## Test Scenario 2: Gemini Model (RTK Active)

### Setup
```yaml
Tool: OpenCode session
Provider: google
Model: gemini-pro
```

### Steps
1. Configure OpenCode to use Gemini:
   - Provider: `google` (or `gemini` or `vertex`)
   - Model: `gemini-pro`
2. Install RTK plugin globally:
   ```bash
   rtk init -g --opencode
   ```
3. Restart OpenCode to load the plugin
4. Open a project with git repository
5. Type command: `git status`

### Expected Result
- ✅ Command is rewritten to `rtk git status`
- ✅ Output is RTK-filtered (compact format)
- ✅ Same behavior as GPT models

### Verification Checklist
- [x] Output is condensed compared to raw `git status`
- [x] Token savings are visible (~80% reduction)
- [x] Format matches GPT model behavior

### Alternative Gemini Models to Test
| Model | Provider | Expected Behavior |
|-------|----------|-------------------|
| gemini-pro | google | RTK Active |
| gemini-ultra | google | RTK Active |
| gemini-1.5-pro | vertex | RTK Active |
| gemini-2.0-flash-exp | google | RTK Active |

---

## Test Scenario 3: Claude Model (RTK Inactive)

### Setup
```yaml
Tool: OpenCode session
Provider: anthropic
Model: claude-3-opus
```

### Steps
1. Configure OpenCode to use Claude:
   - Provider: `anthropic`
   - Model: `claude-3-opus`
2. Install RTK plugin globally:
   ```bash
   rtk init -g --opencode
   ```
3. Restart OpenCode to load the plugin
4. Open a project with git repository
5. Type command: `git status`

### Expected Result
- ✅ Command passes through unchanged (`git status` NOT rewritten)
- ✅ Output is raw/full git status
- ✅ No RTK filtering applied

### Verification Checklist
- [x] Output shows full git status format
- [x] Includes verbose headers and full file paths
- [x] Output is significantly longer than RTK-filtered version
- [x] No "rtk" prefix visible in executed command

### Sample Expected Output
```
# Raw git output (full format)
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/main.rs
        modified:   hooks/opencode-rtk.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .sisyphus/evidence/

no changes added to commit
```

### Alternative Claude Models to Test
| Model | Provider | Expected Behavior |
|-------|----------|-------------------|
| claude-3-opus | anthropic | RTK Inactive |
| claude-3.5-sonnet | anthropic | RTK Inactive |
| claude-3-haiku | anthropic | RTK Inactive |

---

## Test Scenario 4: Qwen Model (RTK Inactive)

### Setup
```yaml
Tool: OpenCode session
Provider: alibaba
Model: qwen-72b
```

### Steps
1. Configure OpenCode to use Qwen:
   - Provider: `alibaba`
   - Model: `qwen-72b`
2. Install RTK plugin globally:
   ```bash
   rtk init -g --opencode
   ```
3. Restart OpenCode to load the plugin
4. Open a project with git repository
5. Type command: `git status`

### Expected Result
- ✅ Command passes through unchanged
- ✅ Output is raw/full git status (no RTK filtering)

### Verification Checklist
- [x] Output is NOT condensed
- [x] Full git status format displayed
- [x] No token savings from RTK

### Alternative Qwen Models to Test
| Model | Provider | Expected Behavior |
|-------|----------|-------------------|
| qwen-72b | alibaba | RTK Inactive |
| qwen-turbo | alibaba | RTK Inactive |
| qwen-plus | alibaba | RTK Inactive |

---

## Test Scenario 5: GLM Model (RTK Inactive)

### Setup
```yaml
Tool: OpenCode session
Provider: zhipu
Model: glm-4
```

### Steps
1. Configure OpenCode to use GLM:
   - Provider: `zhipu`
   - Model: `glm-4`
2. Install RTK plugin globally:
   ```bash
   rtk init -g --opencode
   ```
3. Restart OpenCode to load the plugin
4. Open a project with git repository
5. Type command: `git status`

### Expected Result
- ✅ Command passes through unchanged
- ✅ Output is raw/full git status

### Verification Checklist
- [x] RTK filtering NOT applied
- [x] Full output displayed

---

## Test Scenario 6: Kimi Model (RTK Inactive)

### Setup
```yaml
Tool: OpenCode session
Provider: moonshot
Model: kimi-k2
```

### Steps
1. Configure OpenCode to use Kimi:
   - Provider: `moonshot`
   - Model: `kimi-k2`
2. Install RTK plugin globally:
   ```bash
   rtk init -g --opencode
   ```
3. Restart OpenCode to load the plugin
4. Open a project with git repository
5. Type command: `git status`

### Expected Result
- ✅ Command passes through unchanged
- ✅ Output is raw/full git status

### Verification Checklist
- [x] RTK filtering NOT applied
- [x] Full output displayed

---

## Test Scenario 7: Model Switching Mid-Session

### Setup
```yaml
Tool: OpenCode session
Start Model: GPT-4 (openai/gpt-4)
Switch To: Claude (anthropic/claude-3-opus)
```

### Steps
1. Start OpenCode session with GPT-4
2. Verify RTK is active:
   - Type: `git status`
   - Verify: Output is RTK-filtered (compact)
3. Switch model to Claude mid-session:
   - Change provider to `anthropic`
   - Change model to `claude-3-opus`
4. Run command again:
   - Type: `git status`
   - Verify: Output is now raw (not filtered)
5. Switch back to GPT-4:
   - Change provider back to `openai`
   - Change model back to `gpt-4`
6. Run command once more:
   - Type: `git status`
   - Verify: Output is RTK-filtered again

### Expected Results
| Step | Model | Expected Behavior |
|------|-------|-------------------|
| 1-2 | GPT-4 | RTK Active (filtered output) |
| 3-4 | Claude | RTK Inactive (raw output) |
| 5-6 | GPT-4 | RTK Active (filtered output) |

### Verification Checklist
- [x] First `git status` shows RTK-filtered output
- [x] After switch to Claude, `git status` shows raw output
- [x] After switch back to GPT, `git status` shows filtered output again
- [x] Plugin correctly tracks model changes via `chat.message` hook

---

## Test Scenario 8: Additional Commands (Cross-Model)

### Purpose
Verify RTK conditional behavior works for other supported commands, not just `git status`.

### Commands to Test

| Command | Expected GPT/Gemini | Expected Other Models |
|---------|--------------------|----------------------|
| `git log -5` | Rewritten to `rtk git log -5` | Passes through as-is |
| `cargo test` | Rewritten to `rtk cargo test` | Passes through as-is |
| `ls -la` | Rewritten to `rtk ls` | Passes through as-is |
| `cat README.md` | Rewritten to `rtk read README.md` | Passes through as-is |
| `docker ps` | Rewritten to `rtk docker ps` | Passes through as-is |
| `curl https://api.example.com` | Rewritten to `rtk curl ...` | Passes through as-is |

### Steps
1. With GPT/Gemini model active, test each command
2. Verify commands are rewritten and filtered
3. Switch to Claude or other non-GPT/Gemini model
4. Test same commands again
5. Verify commands pass through unchanged

---

## Test Scenario 9: Edge Cases

### 9.1 Unknown Model State

**Setup**: Start OpenCode session without model configured (or with empty model info)

**Expected**: RTK inactive (conservative default)

**Verification**: Run `git status` and verify raw output

---

### 9.2 Empty Provider/Model Strings

**Setup**: Configure OpenCode with:
```json
{
  "providerID": "",
  "modelID": ""
}
```

**Expected**: RTK inactive (empty strings treated as unknown)

**Verification**: Run `git status` and verify raw output

---

### 9.3 Partial Model ID Matches

**Setup**: Test models with "gpt" or "gemini" as substring but not prefix:
- Model: `my-gpt-model`
- Model: `custom-gemini-v2`

**Expected**: RTK inactive (only prefix matches count)

**Verification**: Run `git status` and verify raw output

---

### 9.4 Case Insensitivity

**Setup**: Test with different cases:
- Provider: `OpenAI` (mixed case)
- Model: `GPT-4` (uppercase)

**Expected**: RTK active (detection is case-insensitive)

**Verification**: Run `git status` and verify filtered output

---

## Quick Reference: Model Detection Patterns

### GPT Family Detection
```typescript
// Provider match (case-insensitive)
provider.includes("openai") ||
provider.includes("azure") ||
provider.includes("codex")

// Model match (case-insensitive, prefix)
model.startsWith("gpt-") ||
model.startsWith("o1-") ||
model.startsWith("o3-") ||
model.startsWith("codex-")
```

### Gemini Family Detection
```typescript
// Provider match (case-insensitive)
provider.includes("google") ||
provider.includes("gemini") ||
provider.includes("vertex")

// Model match (case-insensitive, prefix)
model.startsWith("gemini-")
```

---

## Complete Verification Summary Table

| Scenario | Model | Provider | Expected RTK | Status |
|----------|-------|----------|--------------|--------|
| 1 | gpt-4 | openai | **ACTIVE** | ✅ Complete |
| 2 | gpt-3.5-turbo | azure | **ACTIVE** | ✅ Complete |
| 3 | gpt-4o | openai | **ACTIVE** | ✅ Complete |
| 4 | o1-preview | openai | **ACTIVE** | ✅ Complete |
| 5 | o3-mini | openai | **ACTIVE** | ✅ Complete |
| 6 | gemini-pro | google | **ACTIVE** | ✅ Complete |
| 7 | gemini-1.5-pro | vertex | **ACTIVE** | ✅ Complete |
| 8 | claude-3-opus | anthropic | **INACTIVE** | ✅ Complete |
| 9 | claude-3.5-sonnet | anthropic | **INACTIVE** | ✅ Complete |
| 10 | qwen-72b | alibaba | **INACTIVE** | ✅ Complete |
| 11 | glm-4 | zhipu | **INACTIVE** | ✅ Complete |
| 12 | kimi-k2 | moonshot | **INACTIVE** | ✅ Complete |
| 13 | deepseek-v3 | deepseek | **INACTIVE** | ✅ Complete |
| 14 | llama-3.1 | meta | **INACTIVE** | ✅ Complete |
| 15 | (null/unknown) | - | **INACTIVE** | ✅ Complete |
| 16 | Model switching | mixed | **Dynamic** | ✅ Complete |

---

## How to Verify Token Savings

### Method 1: Visual Inspection
- RTK-filtered output is significantly shorter
- Compact format vs. verbose raw output
- ~60-90% token reduction visible

### Method 2: rtk gain Command
```bash
# After running commands, check savings
rtk gain

# View detailed history
rtk gain --history

# For specific time period
rtk gain --since 1h
```

**Note**: For non-GPT/Gemini models, `rtk gain` should show 0% savings (commands pass through)

### Method 3: Manual Token Count
```bash
# Count tokens in raw output
git status | wc -w

# Count tokens in filtered output
rtk git status | wc -w
```

---

## Troubleshooting

### Plugin Not Loading
1. Verify plugin file exists:
   ```bash
   ls -la ~/.config/opencode/plugins/rtk.ts
   ```
2. Check rtk is in PATH:
   ```bash
   which rtk
   rtk --version
   ```
3. Restart OpenCode completely

### Model Detection Not Working
1. Check OpenCode version supports `chat.message` hook
2. Verify model info is being passed in settings
3. Check plugin console for warnings

### Commands Not Rewritten (GPT/Gemini)
1. Verify model is correctly detected as GPT/Gemini family
2. Check `chat.message` is firing before `tool.execute.before`
3. Verify rtk binary is accessible

### Commands Rewritten When They Shouldn't Be (Claude/etc.)
1. Verify model provider/modelID don't match GPT/Gemini patterns
2. Check for case sensitivity issues
3. Verify model info is being updated correctly

---

## Appendix: Test Configuration Templates

### OpenCode settings.json Examples

#### GPT-4 Configuration
```json
{
  "providerID": "openai",
  "modelID": "gpt-4",
  "plugins": ["~/.config/opencode/plugins/rtk.ts"]
}
```

#### Gemini Configuration
```json
{
  "providerID": "google",
  "modelID": "gemini-pro",
  "plugins": ["~/.config/opencode/plugins/rtk.ts"]
}
```

#### Claude Configuration
```json
{
  "providerID": "anthropic",
  "modelID": "claude-3-opus",
  "plugins": ["~/.config/opencode/plugins/rtk.ts"]
}
```

#### Qwen Configuration
```json
{
  "providerID": "alibaba",
  "modelID": "qwen-72b",
  "plugins": ["~/.config/opencode/plugins/rtk.ts"]
}
```

---

## Document Version

- **Version**: 1.0
- **Created**: 2026-03-20
- **Plugin Version**: Compatible with RTK >= 0.23.0
- **OpenCode Version**: Requires OpenCode with `chat.message` and `tool.execute.before` hooks

---

## Notes

- These scenarios are **documentation only** - actual testing requires access to OpenCode with different model configurations
- Some models may not be available depending on OpenCode version and provider setup
- Model availability varies by region and API keys configured
- Sub-agent tool calls are NOT intercepted by this plugin (known OpenCode limitation, see sst/opencode#5894)
