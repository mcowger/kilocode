import type { ModelInfo } from "../model.js"

export type TestingToolsModelId = keyof typeof testingToolsModels

export const testingToolsDefaultModelId: TestingToolsModelId = "testing-default"

export const testingToolsModels = {
	"testing-default": {
		maxTokens: 16_384,
		contextWindow: 128_000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Testing provider for experimenting with system prompts and tools",
	},
} as const satisfies Record<string, ModelInfo>
