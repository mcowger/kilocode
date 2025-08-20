// kilocode_change -- file added

import type { ModelInfo } from "../model.js"
import type { ProviderName } from "../provider-settings.js"

export const codexModels = {
	"gpt-5": {
		id: "gpt-5",
		name: "GPT-5",
		provider: "codex" as ProviderName,
		contextWindow: 400000,
		maxTokens: 128000,
		supportsPromptCache: false,
	},
	"gpt-5-mini": {
		id: "gpt-5-mini",
		name: "GPT-5 Mini",
		provider: "codex" as ProviderName,
		contextWindow: 400000,
		maxTokens: 128000,
		supportsPromptCache: false,
	},
	"gpt-5-nano": {
		id: "gpt-5-nano",
		name: "GPT-5 Nano",
		provider: "codex" as ProviderName,
		contextWindow: 400000,
		maxTokens: 128000,
		supportsPromptCache: false,
	},
} as const

export type codexModelId = keyof typeof codexModels

export const codexDefaultModelId: codexModelId = "gpt-5"

export const isCodexModel = (modelId: string): modelId is codexModelId => {
	return modelId in codexModels
}

export const getCodexModelInfo = (modelId: string): ModelInfo => {
	if (isCodexModel(modelId)) {
		return codexModels[modelId]
	}
	// Fallback to a default or throw an error
	return codexModels[codexDefaultModelId]
}

export type CodexProvider = {
	id: "codex"
	apiKey?: string
	baseUrl?: string
	model: codexModelId
}
