import type { Plugin } from "@opencode-ai/plugin"

// RTK OpenCode plugin — rewrites commands to use rtk for token savings.
// Requires: rtk >= 0.23.0 in PATH.
//
// This is a thin delegating plugin: all rewrite logic lives in `rtk rewrite`,
// which is the single source of truth (src/discover/registry.rs).
// To add or change rewrite rules, edit the Rust registry — not this file.

const modelBySession = new Map<string, ModelInfo | null>()

export interface ModelInfo {
  providerID?: string
  modelID?: string
}

export function isGptOrGeminiFamily(model: ModelInfo | null | undefined): boolean {
  if (!model) return false

  const providerID = model.providerID?.toLowerCase() ?? ""
  const modelID = model.modelID?.toLowerCase() ?? ""

  if (providerID === "" && modelID === "") return false

  const isGptProvider = providerID.includes("openai") ||
                        providerID.includes("codex")

  const isGptModel = modelID.startsWith("gpt-") ||
                     modelID.startsWith("o1-") ||
                     modelID.startsWith("o3-") ||
                     modelID.startsWith("codex-")

  if (isGptProvider || isGptModel) return true

  const isGeminiProvider = providerID.includes("gemini")

  const isGeminiModel = modelID.startsWith("gemini-")

  return isGeminiProvider || isGeminiModel
}

export const RtkOpenCodePlugin: Plugin = async ({ $ }) => {
  try {
    await $`which rtk`.quiet()
  } catch {
    console.warn("[rtk] rtk binary not found in PATH — plugin disabled")
    return {}
  }

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
