import type { Plugin } from "@opencode-ai/plugin"
import * as path from "path"
import * as os from "os"

// RTK OpenCode plugin — rewrites commands to use rtk for token savings.
// Requires: rtk >= 0.23.0 in PATH.
//
// This is a thin delegating plugin: all rewrite logic lives in `rtk rewrite`,
// which is the single source of truth (src/discover/registry.rs).
// To add or change rewrite rules, edit the Rust registry — not this file.

const modelBySession = new Map<string, ModelInfo | null>()
let modelMatcher: ((model: ModelInfo | null | undefined) => boolean) | null = null

export interface ModelInfo {
  providerID?: string
  modelID?: string
}

export const DEFAULT_ENABLED_PATTERNS = ["claude", "gpt", "codex", "gemini", "o1", "o3"]

export function createModelMatcher(patterns: string[]): (model: ModelInfo | null | undefined) => boolean {
  // Filter patterns: keep only strings, remove empty strings
  const validPatterns = patterns.filter((p): p is string => typeof p === "string" && p.length > 0)

  return (model: ModelInfo | null | undefined): boolean => {
    if (!model) return false

    const modelID = model.modelID?.toLowerCase().trim() ?? ""

    if (modelID === "") return false

    // Case-insensitive substring matching
    return validPatterns.some((pattern) => modelID.includes(pattern.toLowerCase()))
  }
}

export function isGptOrGeminiFamily(model: ModelInfo | null | undefined): boolean {
  // Use the stored matcher if available, otherwise create with defaults
  const matcher = modelMatcher ?? createModelMatcher(DEFAULT_ENABLED_PATTERNS)
  return matcher(model)
}

export async function loadConfig(): Promise<string[]> {
  try {
    // Resolve config directory: respect XDG_CONFIG_HOME or use ~/.config
    const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config")
    const configPath = path.join(configDir, "opencode", "rtk.json")

    // Try to read and parse the config file
    const file = Bun.file(configPath)
    const exists = await file.exists()

    if (!exists) {
      console.warn("[rtk] Config file not found at " + configPath + ", using defaults")
      return DEFAULT_ENABLED_PATTERNS
    }

    const data = await file.json()

    // Validate that data is an array
    if (!Array.isArray(data)) {
      console.warn("[rtk] Config file must contain a JSON array, using defaults")
      return DEFAULT_ENABLED_PATTERNS
    }

    // Filter to strings only, remove empty strings
    const patterns = data.filter((p): p is string => typeof p === "string" && p.length > 0)

    // If no valid patterns after filtering, use defaults
    if (patterns.length === 0) {
      console.warn("[rtk] Config file contains no valid patterns, using defaults")
      return DEFAULT_ENABLED_PATTERNS
    }

    return patterns
  } catch (error) {
    // On ANY error (parse error, permission denied, etc.), fallback to defaults
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.warn("[rtk] Failed to load config: " + errorMsg + ", using defaults")
    return DEFAULT_ENABLED_PATTERNS
  }
}

export const RtkOpenCodePlugin: Plugin = async ({ $ }) => {
  try {
    await $`which rtk`.quiet()
  } catch {
    console.warn("[rtk] rtk binary not found in PATH — plugin disabled")
    return {}
  }

  // Config loaded once at plugin init. Restart OpenCode after config changes.
  const patterns = await loadConfig()
  modelMatcher = createModelMatcher(patterns)

  return {
    "chat.message": async (input) => {
      const sessionID = input?.sessionID
      if (typeof sessionID !== "string" || sessionID.length === 0) return

      const model = input?.model
      if (!model || typeof model !== "object") {
        modelBySession.set(sessionID, null)
        return
      }

      modelBySession.set(sessionID, {
        providerID: String(model.providerID ?? ""),
        modelID: String(model.modelID ?? "")
      })
    },
    "tool.execute.before": async (input, output) => {
      const tool = (input?.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return

      // Only rewrite for GPT/Gemini family models
      const sessionModel = modelBySession.get(input?.sessionID ?? "") ?? null
      if (!isGptOrGeminiFamily(sessionModel)) {
        return  // Pass through for non-GPT/Gemini models
      }

      const args = output?.args
      if (!args || typeof args !== "object") return

      const command = (args as Record<string, unknown>).command
      if (typeof command !== "string" || command.trim() === "") return

      try {
        const result = await $`rtk rewrite ${command}`.quiet().nothrow()
        const rewritten = String(result.stdout).trim()
        if (rewritten && rewritten !== command) {
          ;(args as Record<string, unknown>).command = rewritten
        }
      } catch {
        // rtk rewrite failed — pass through unchanged
      }
    },
  }
}
