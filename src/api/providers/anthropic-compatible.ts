import {
	type ModelInfo,
	type AnthropicModelId,
	anthropicDefaultModelId,
	anthropicModels,
	NATIVE_TOOL_DEFAULTS,
	openAiModelInfoSaneDefaults,
} from "@roo-code/types"

import type { ApiHandlerOptions } from "../../shared/api"

import { getModelParams } from "../transform/model-params"

import { AnthropicHandler } from "./anthropic"

const anthropicCompatibleModelInfoDefaults: ModelInfo = {
	...openAiModelInfoSaneDefaults,
	maxTokens: 16384,
}

export class AnthropicCompatibleHandler extends AnthropicHandler {
	private readonly compatibilityOptions: ApiHandlerOptions

	constructor(options: ApiHandlerOptions) {
		const deploymentName = options.anthropicDeploymentName?.trim() || options.apiModelId?.trim() || ""
		super({
			...options,
			anthropicDeploymentName: deploymentName,
		})
		this.compatibilityOptions = {
			...options,
			anthropicDeploymentName: deploymentName,
		}
	}

	override getModel(): ReturnType<AnthropicHandler["getModel"]> {
		const selectedId = this.compatibilityOptions.apiModelId?.trim() || ""
		const knownModelInfo = selectedId ? anthropicModels[selectedId as AnthropicModelId] : undefined
		const customInfo = this.compatibilityOptions.anthropicCustomModelInfo

		const info: ModelInfo = {
			...NATIVE_TOOL_DEFAULTS,
			...(knownModelInfo ?? anthropicCompatibleModelInfoDefaults),
			...(customInfo ?? {}),
		}

		const id = selectedId || anthropicDefaultModelId
		const params = getModelParams({
			format: "anthropic",
			modelId: id,
			model: info,
			settings: this.compatibilityOptions,
		})
		return {
			id,
			info,
			betas: undefined,
			...params,
		} as ReturnType<AnthropicHandler["getModel"]>
	}
}
