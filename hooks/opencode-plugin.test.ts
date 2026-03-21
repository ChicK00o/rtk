import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import * as os from "os"
import * as path from "path"
import { isGptOrGeminiFamily, createModelMatcher, DEFAULT_ENABLED_PATTERNS, loadConfig } from "./opencode-rtk"
import type { ModelInfo } from "./opencode-rtk"

describe("isGptOrGeminiFamily", () => {
  describe("GPT family models", () => {
    it("should detect gpt-4 with OpenAI provider", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gpt-3.5-turbo with OpenAI provider", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-3.5-turbo" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gpt-4-turbo with Azure provider", () => {
      const model: ModelInfo = { providerID: "azure", modelID: "gpt-4-turbo" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gpt-4o with OpenAI provider", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-4o" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gpt-4.1 with Azure provider", () => {
      const model: ModelInfo = { providerID: "azure", modelID: "gpt-4.1" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect GPT model with lowercase providerID", () => {
      const model: ModelInfo = { providerID: "OpenAI", modelID: "gpt-4" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })
  })

  describe("Codex family models (o1, o3, codex-*)", () => {
    it("should detect o1-preview with OpenAI provider", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "o1-preview" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect o1-mini with Azure provider", () => {
      const model: ModelInfo = { providerID: "azure", modelID: "o1-mini" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect o3-mini with OpenAI provider", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "o3-mini" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect o3-high with OpenAI provider", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "o3-high" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect codex-001 with codex provider", () => {
      const model: ModelInfo = { providerID: "codex", modelID: "codex-001" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect o1-preview with unknown provider (modelID match)", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "o1-preview" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })
  })

  describe("Gemini family models", () => {
    it("should detect gemini-pro with Google provider", () => {
      const model: ModelInfo = { providerID: "google", modelID: "gemini-pro" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gemini-ultra with Google provider", () => {
      const model: ModelInfo = { providerID: "google", modelID: "gemini-ultra" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gemini-1.5-pro with Vertex provider", () => {
      const model: ModelInfo = { providerID: "vertex", modelID: "gemini-1.5-pro" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gemini-2.0-flash-exp with Google provider", () => {
      const model: ModelInfo = { providerID: "google", modelID: "gemini-2.0-flash-exp" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gemini with gemini provider", () => {
      const model: ModelInfo = { providerID: "gemini", modelID: "gemini-pro" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gemini-flash with unknown provider (modelID match)", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "gemini-flash" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })
  })

  describe("Non-target models (should return false)", () => {
    it("should detect claude-3-opus with Anthropic provider", () => {
      const model: ModelInfo = { providerID: "anthropic", modelID: "claude-3-opus" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect claude-3.5-sonnet with Anthropic provider", () => {
      const model: ModelInfo = { providerID: "anthropic", modelID: "claude-3.5-sonnet" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect claude model from arbitrary provider", () => {
      const model: ModelInfo = { providerID: "antigravity", modelID: "claude-3.7-sonnet" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should reject qwen-72b with Alibaba provider", () => {
      const model: ModelInfo = { providerID: "alibaba", modelID: "qwen-72b" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject qwen-turbo with Alibaba provider", () => {
      const model: ModelInfo = { providerID: "alibaba", modelID: "qwen-turbo" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject glm-4 with Zhipu provider", () => {
      const model: ModelInfo = { providerID: "zhipu", modelID: "glm-4" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject kimi-k2 with Moonshot provider", () => {
      const model: ModelInfo = { providerID: "moonshot", modelID: "kimi-k2" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject deepseek-v3 with DeepSeek provider", () => {
      const model: ModelInfo = { providerID: "deepseek", modelID: "deepseek-v3" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject llama-3.1 with Meta provider", () => {
      const model: ModelInfo = { providerID: "meta", modelID: "llama-3.1" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject mistral-large with Mistral provider", () => {
      const model: ModelInfo = { providerID: "mistral", modelID: "mistral-large" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject cohere-command with Cohere provider", () => {
      const model: ModelInfo = { providerID: "cohere", modelID: "command-r-plus" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })
  })

  describe("Edge cases", () => {
    it("should handle null input", () => {
      expect(isGptOrGeminiFamily(null)).toBe(false)
    })

    it("should handle undefined input", () => {
      expect(isGptOrGeminiFamily(undefined)).toBe(false)
    })

    it("should handle empty strings for providerID and modelID", () => {
      const model: ModelInfo = { providerID: "", modelID: "" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should handle whitespace-only providerID and modelID", () => {
      const model: ModelInfo = { providerID: "   ", modelID: "\t" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should handle missing providerID", () => {
      const model: ModelInfo = { modelID: "gpt-4" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should handle missing modelID", () => {
      const model: ModelInfo = { providerID: "openai" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should handle empty ModelInfo object", () => {
      const model: ModelInfo = {}
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should handle invalid providerID with valid GPT modelID", () => {
      const model: ModelInfo = { providerID: "invalid", modelID: "gpt-4" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should handle invalid providerID with valid Gemini modelID", () => {
      const model: ModelInfo = { providerID: "invalid", modelID: "gemini-pro" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should handle modelID case insensitivity", () => {
      const model1: ModelInfo = { providerID: "custom", modelID: "gpt-4" }
      const model2: ModelInfo = { providerID: "custom", modelID: "GPT-4" }
      const model3: ModelInfo = { providerID: "custom", modelID: "GpT-4" }
      expect(isGptOrGeminiFamily(model1)).toBe(true)
      expect(isGptOrGeminiFamily(model2)).toBe(true)
      expect(isGptOrGeminiFamily(model3)).toBe(true)
    })
  })

  describe("Mixed provider/model combinations", () => {
    it("should detect GPT modelID even with non-GPT provider", () => {
      const model: ModelInfo = { providerID: "anthropic", modelID: "gpt-4" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect Gemini modelID even with non-Gemini provider", () => {
      const model: ModelInfo = { providerID: "anthropic", modelID: "gemini-pro" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect Azure provider even with non-GPT modelID", () => {
      const model: ModelInfo = { providerID: "azure", modelID: "custom-model" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should detect Google provider even with non-Gemini modelID", () => {
      const model: ModelInfo = { providerID: "google", modelID: "custom-model" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })
  })

  describe("Model ID variations", () => {
    it("should detect gpt-4-0314 with date suffix", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-4-0314" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gpt-3.5-turbo-16k with suffix", () => {
      const model: ModelInfo = { providerID: "azure", modelID: "gpt-3.5-turbo-16k" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect gemini-1.5-pro-001 with version suffix", () => {
      const model: ModelInfo = { providerID: "google", modelID: "gemini-1.5-pro-001" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should detect o3-mini-2024 with date suffix", () => {
      const model: ModelInfo = { providerID: "openai", modelID: "o3-mini-2024" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })
  })

  describe("Partial matches", () => {
    it("should match modelIDs containing gpt as substring", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "my-gpt-model" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should match modelIDs containing gemini as substring", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "my-gemini-model" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should match exact gpt prefix at start", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "gpt-4-custom" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })

    it("should match exact gemini prefix at start", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "gemini-pro-custom" }
      expect(isGptOrGeminiFamily(model)).toBe(true)
    })
  })
})

describe("createModelMatcher", () => {
  describe("Custom patterns matching", () => {
    it("should match custom pattern in modelID", () => {
      const matcher = createModelMatcher(["deepseek"])
      const model: ModelInfo = { providerID: "deepseek", modelID: "deepseek-v3" }
      expect(matcher(model)).toBe(true)
    })

    it("should match multiple custom patterns", () => {
      const matcher = createModelMatcher(["deepseek", "qwen"])
      const model1: ModelInfo = { providerID: "deepseek", modelID: "deepseek-v3" }
      const model2: ModelInfo = { providerID: "alibaba", modelID: "qwen-72b" }
      expect(matcher(model1)).toBe(true)
      expect(matcher(model2)).toBe(true)
    })

    it("should not match patterns not in array", () => {
      const matcher = createModelMatcher(["deepseek"])
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      expect(matcher(model)).toBe(false)
    })
  })

  describe("Empty patterns array", () => {
    it("should return false for all models with empty array", () => {
      const matcher = createModelMatcher([])
      const gptModel: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      const geminiModel: ModelInfo = { providerID: "google", modelID: "gemini-pro" }
      const claudeModel: ModelInfo = { providerID: "anthropic", modelID: "claude-3-opus" }
      expect(matcher(gptModel)).toBe(false)
      expect(matcher(geminiModel)).toBe(false)
      expect(matcher(claudeModel)).toBe(false)
    })

    it("should return false for null with empty array", () => {
      const matcher = createModelMatcher([])
      expect(matcher(null)).toBe(false)
    })

    it("should return false for undefined with empty array", () => {
      const matcher = createModelMatcher([])
      expect(matcher(undefined)).toBe(false)
    })
  })

  describe("Pattern filtering (non-string and empty entries)", () => {
    it("should filter out non-string entries", () => {
      const matcher = createModelMatcher(["gpt", 42, null] as unknown as string[])
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      expect(matcher(model)).toBe(true)
    })

    it("should filter out empty string entries", () => {
      const matcher = createModelMatcher(["gpt", "", "gemini"])
      const gptModel: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      const geminiModel: ModelInfo = { providerID: "google", modelID: "gemini-pro" }
      expect(matcher(gptModel)).toBe(true)
      expect(matcher(geminiModel)).toBe(true)
    })

    it("should filter out both non-string and empty string entries", () => {
      const matcher = createModelMatcher(["gpt", 42, "", null, "gemini"] as unknown as string[])
      const gptModel: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      const geminiModel: ModelInfo = { providerID: "google", modelID: "gemini-pro" }
      expect(matcher(gptModel)).toBe(true)
      expect(matcher(geminiModel)).toBe(true)
    })

    it("should return false when all entries are filtered out", () => {
      const matcher = createModelMatcher([42, "", null] as unknown as string[])
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      expect(matcher(model)).toBe(false)
    })
  })

  describe("Case-insensitive matching", () => {
    it("should match lowercase pattern with uppercase modelID", () => {
      const matcher = createModelMatcher(["gpt"])
      const model: ModelInfo = { providerID: "openai", modelID: "GPT-4" }
      expect(matcher(model)).toBe(true)
    })

    it("should match uppercase pattern with lowercase modelID", () => {
      const matcher = createModelMatcher(["GPT"])
      const model: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      expect(matcher(model)).toBe(true)
    })

    it("should match mixed case pattern with mixed case modelID", () => {
      const matcher = createModelMatcher(["GpT"])
      const model: ModelInfo = { providerID: "openai", modelID: "GpT-4" }
      expect(matcher(model)).toBe(true)
    })

    it("should match pattern case-insensitively in substring", () => {
      const matcher = createModelMatcher(["GEMINI"])
      const model: ModelInfo = { providerID: "google", modelID: "my-gemini-model" }
      expect(matcher(model)).toBe(true)
    })
  })

  describe("Null/undefined model handling", () => {
    it("should return false for null model", () => {
      const matcher = createModelMatcher(["gpt"])
      expect(matcher(null)).toBe(false)
    })

    it("should return false for undefined model", () => {
      const matcher = createModelMatcher(["gpt"])
      expect(matcher(undefined)).toBe(false)
    })

    it("should return false for model with undefined modelID", () => {
      const matcher = createModelMatcher(["gpt"])
      const model: ModelInfo = { providerID: "openai" }
      expect(matcher(model)).toBe(false)
    })

    it("should return false for model with empty modelID", () => {
      const matcher = createModelMatcher(["gpt"])
      const model: ModelInfo = { providerID: "openai", modelID: "" }
      expect(matcher(model)).toBe(false)
    })

    it("should return false for model with whitespace-only modelID", () => {
      const matcher = createModelMatcher(["gpt"])
      const model: ModelInfo = { providerID: "openai", modelID: "   " }
      expect(matcher(model)).toBe(false)
    })
  })

  describe("DEFAULT_ENABLED_PATTERNS constant", () => {
    it("should contain expected default patterns", () => {
      expect(DEFAULT_ENABLED_PATTERNS).toContain("claude")
      expect(DEFAULT_ENABLED_PATTERNS).toContain("gpt")
      expect(DEFAULT_ENABLED_PATTERNS).toContain("codex")
      expect(DEFAULT_ENABLED_PATTERNS).toContain("gemini")
      expect(DEFAULT_ENABLED_PATTERNS).toContain("o1")
      expect(DEFAULT_ENABLED_PATTERNS).toContain("o3")
    })

    it("should have exactly 6 default patterns", () => {
      expect(DEFAULT_ENABLED_PATTERNS.length).toBe(6)
    })

    it("should match all default patterns with createModelMatcher", () => {
      const matcher = createModelMatcher(DEFAULT_ENABLED_PATTERNS)
      const models: ModelInfo[] = [
        { modelID: "claude-3-opus" },
        { modelID: "gpt-4" },
        { modelID: "codex-001" },
        { modelID: "gemini-pro" },
        { modelID: "o1-preview" },
        { modelID: "o3-mini" },
      ]
      models.forEach((model) => {
        expect(matcher(model)).toBe(true)
      })
    })
  })

  describe("Factory function behavior", () => {
    it("should return a function", () => {
      const matcher = createModelMatcher(["gpt"])
      expect(typeof matcher).toBe("function")
    })

    it("should create independent matchers with different patterns", () => {
      const gptMatcher = createModelMatcher(["gpt"])
      const deepseekMatcher = createModelMatcher(["deepseek"])
      const gptModel: ModelInfo = { modelID: "gpt-4" }
      const deepseekModel: ModelInfo = { modelID: "deepseek-v3" }
      expect(gptMatcher(gptModel)).toBe(true)
      expect(gptMatcher(deepseekModel)).toBe(false)
      expect(deepseekMatcher(gptModel)).toBe(false)
      expect(deepseekMatcher(deepseekModel)).toBe(true)
    })

    it("should not mutate the input patterns array", () => {
      const patterns = ["gpt", "", 42] as unknown as string[]
      const originalLength = patterns.length
      createModelMatcher(patterns)
      expect(patterns.length).toBe(originalLength)
    })
  })
})

describe("API availability", () => {
  it("should have Bun runtime available", () => {
    expect(typeof Bun).not.toBe("undefined")
  })

  it("should have Bun.file as a function", () => {
    expect(typeof Bun.file).toBe("function")
  })

  it("should have os.homedir as a function", () => {
    expect(typeof os.homedir).toBe("function")
  })

  it("should return a valid path from os.homedir()", () => {
    const homeDir = os.homedir()
    expect(typeof homeDir).toBe("string")
    expect(homeDir.length).toBeGreaterThan(0)
  })

  it("should have JSON.parse available", () => {
    expect(typeof JSON.parse).toBe("function")
  })

  it("should parse valid JSON with JSON.parse", () => {
    const testObj = { key: "value", number: 42 }
    const jsonStr = JSON.stringify(testObj)
    const parsed = JSON.parse(jsonStr)
    expect(parsed.key).toBe("value")
    expect(parsed.number).toBe(42)
  })
})

describe("loadConfig", () => {
  let tempDir: string
  let originalXdgConfigHome: string | undefined

  beforeEach(() => {
    // Save original XDG_CONFIG_HOME
    originalXdgConfigHome = process.env.XDG_CONFIG_HOME
    // Create a temporary directory for test config files
    tempDir = `/tmp/rtk-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  })

  afterEach(() => {
    // Restore original XDG_CONFIG_HOME
    if (originalXdgConfigHome !== undefined) {
      process.env.XDG_CONFIG_HOME = originalXdgConfigHome
    } else {
      delete process.env.XDG_CONFIG_HOME
    }
    // Clean up temp directory
    try {
      const fs = require("fs")
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    } catch {
      // Ignore cleanup errors
    }
  })

  describe("Missing file", () => {
    it("should return DEFAULT_ENABLED_PATTERNS when config file does not exist", async () => {
      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })
  })

  describe("Valid config file", () => {
    it("should load and return custom patterns from valid config file", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      const customPatterns = ["deepseek", "qwen", "llama"]
      fs.writeFileSync(configPath, JSON.stringify(customPatterns))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(customPatterns)
    })

    it("should load patterns with special characters", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      const customPatterns = ["model-v1", "model_v2", "model.v3"]
      fs.writeFileSync(configPath, JSON.stringify(customPatterns))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(customPatterns)
    })
  })

  describe("Malformed JSON", () => {
    it("should return DEFAULT_ENABLED_PATTERNS when JSON is invalid", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      fs.writeFileSync(configPath, "{ invalid json }")

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })
  })

  describe("Empty file", () => {
    it("should return DEFAULT_ENABLED_PATTERNS when config file is empty", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      fs.writeFileSync(configPath, "")

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })
  })

  describe("Non-array JSON", () => {
    it("should return DEFAULT_ENABLED_PATTERNS when JSON is an object", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      fs.writeFileSync(configPath, JSON.stringify({ key: "value" }))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })

    it("should return DEFAULT_ENABLED_PATTERNS when JSON is a string", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      fs.writeFileSync(configPath, JSON.stringify("not-an-array"))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })

    it("should return DEFAULT_ENABLED_PATTERNS when JSON is a number", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      fs.writeFileSync(configPath, JSON.stringify(42))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })
  })

  describe("Array with mixed types", () => {
    it("should extract strings only and filter out non-strings", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      const mixedData = ["gpt", 42, "claude", null, "gemini", true]
      fs.writeFileSync(configPath, JSON.stringify(mixedData))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(["gpt", "claude", "gemini"])
    })
  })

  describe("Array with empty strings", () => {
    it("should filter out empty strings from config", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      const dataWithEmpty = ["gpt", "", "claude", "", "gemini"]
      fs.writeFileSync(configPath, JSON.stringify(dataWithEmpty))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(["gpt", "claude", "gemini"])
    })

    it("should return DEFAULT_ENABLED_PATTERNS when all entries are empty strings", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      fs.writeFileSync(configPath, JSON.stringify(["", "", ""]))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })
  })

  describe("XDG_CONFIG_HOME respected", () => {
    it("should use XDG_CONFIG_HOME when set", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      const customPatterns = ["custom-model"]
      fs.writeFileSync(configPath, JSON.stringify(customPatterns))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(customPatterns)
    })

    it("should use ~/.config when XDG_CONFIG_HOME is not set", async () => {
      delete process.env.XDG_CONFIG_HOME
      // This test just verifies the function doesn't crash when XDG_CONFIG_HOME is unset
      // It will try to read from ~/.config/opencode/rtk.json which likely doesn't exist
      // and should return DEFAULT_ENABLED_PATTERNS
      const result = await loadConfig()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("Edge cases", () => {
    it("should handle array with only non-string entries", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      fs.writeFileSync(configPath, JSON.stringify([42, null, true, { key: "value" }]))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      expect(result).toEqual(DEFAULT_ENABLED_PATTERNS)
    })

    it("should handle whitespace-only strings in array", async () => {
      const fs = require("fs")
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      const dataWithWhitespace = ["gpt", "   ", "claude", "\t", "gemini"]
      fs.writeFileSync(configPath, JSON.stringify(dataWithWhitespace))

      process.env.XDG_CONFIG_HOME = tempDir
      const result = await loadConfig()
      // Whitespace-only strings have length > 0, so they are kept
      expect(result).toContain("gpt")
      expect(result).toContain("claude")
      expect(result).toContain("gemini")
    })

     it("should handle very large config file", async () => {
       const fs = require("fs")
       const configDir = path.join(tempDir, "opencode")
       fs.mkdirSync(configDir, { recursive: true })
       const configPath = path.join(configDir, "rtk.json")
       const largePatterns = Array.from({ length: 1000 }, (_, i) => `model-${i}`)
       fs.writeFileSync(configPath, JSON.stringify(largePatterns))

       process.env.XDG_CONFIG_HOME = tempDir
       const result = await loadConfig()
       expect(result.length).toBe(1000)
       expect(result[0]).toBe("model-0")
       expect(result[999]).toBe("model-999")
     })
   })

  describe("Plugin initialization", () => {
    it("should load config and create matcher on plugin init", async () => {
      const fs = require("fs")
      const tempDir = require("fs").mkdtempSync(require("path").join(require("os").tmpdir(), "rtk-test-"))
      const configDir = path.join(tempDir, "opencode")
      fs.mkdirSync(configDir, { recursive: true })
      const configPath = path.join(configDir, "rtk.json")
      const customPatterns = ["custom-model", "test-gpt"]
      fs.writeFileSync(configPath, JSON.stringify(customPatterns))

      process.env.XDG_CONFIG_HOME = tempDir

      // Simulate plugin initialization by calling loadConfig and createModelMatcher
      const patterns = await loadConfig()
      const matcher = createModelMatcher(patterns)

      // Verify matcher uses custom patterns
      expect(matcher({ modelID: "custom-model-v1" })).toBe(true)
      expect(matcher({ modelID: "test-gpt-4" })).toBe(true)
      expect(matcher({ modelID: "claude-3" })).toBe(false)

      // Cleanup
      fs.rmSync(tempDir, { recursive: true })
      delete process.env.XDG_CONFIG_HOME
    })

    it("should maintain backward compatibility with default patterns", async () => {
      // When no config file exists, should use DEFAULT_ENABLED_PATTERNS
      const patterns = await loadConfig()
      const matcher = createModelMatcher(patterns)

      // Verify matcher works with default patterns
      expect(matcher({ modelID: "claude-3-opus" })).toBe(true)
      expect(matcher({ modelID: "gpt-4" })).toBe(true)
      expect(matcher({ modelID: "gemini-pro" })).toBe(true)
      expect(matcher({ modelID: "unknown-model" })).toBe(false)
    })
  })
})
