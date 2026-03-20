import { describe, it, expect } from "bun:test"
import { isGptOrGeminiFamily } from "./opencode-rtk"
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

  describe("Non-GPT/Gemini models (should return false)", () => {
    it("should reject claude-3-opus with Anthropic provider", () => {
      const model: ModelInfo = { providerID: "anthropic", modelID: "claude-3-opus" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should reject claude-3.5-sonnet with Anthropic provider", () => {
      const model: ModelInfo = { providerID: "anthropic", modelID: "claude-3.5-sonnet" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
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
      expect(isGptOrGeminiFamily(model)).toBe(true)
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

    it("should handle providerID case insensitivity (openai vs OPENAI)", () => {
      const model1: ModelInfo = { providerID: "openai", modelID: "gpt-4" }
      const model2: ModelInfo = { providerID: "OPENAI", modelID: "gpt-4" }
      const model3: ModelInfo = { providerID: "OpenAI", modelID: "gpt-4" }
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
    it("should not match modelIDs containing gpt as substring", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "my-gpt-model" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
    })

    it("should not match modelIDs containing gemini as substring", () => {
      const model: ModelInfo = { providerID: "custom", modelID: "my-gemini-model" }
      expect(isGptOrGeminiFamily(model)).toBe(false)
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
