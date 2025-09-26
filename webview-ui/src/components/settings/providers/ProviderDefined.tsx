import { useCallback, useEffect, useMemo, useState } from "react"
import { useEvent } from "react-use"
import { VSCodeTextField, VSCodeButton, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"
import { ModelRecord } from "@roo/api"
import { ExtensionMessage } from "@roo/ExtensionMessage"

import { vscode } from "@src/utils/vscode"

import { inputEventTransform } from "../transforms"

type ProviderDefinedProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const ProviderDefined = ({ apiConfiguration, setApiConfigurationField }: ProviderDefinedProps) => {
	const [models, setModels] = useState<ModelRecord>({})
	const [providerName, setProviderName] = useState<string | undefined>()
	const [isFetching, setIsFetching] = useState(false)
	const [fetchError, setFetchError] = useState<string | undefined>()
	const [hasFetched, setHasFetched] = useState(false)

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	const handleFetchModels = useCallback(() => {
		const manifestUrl = apiConfiguration?.providerDefinedManifestUrl?.trim()

		if (!manifestUrl) {
			setFetchError("Manifest URL is required before fetching models.")
			return
		}

		setIsFetching(true)
		setFetchError(undefined)
		setHasFetched(false)
		setModels({})
		setProviderName(undefined)

		vscode.postMessage({
			type: "requestProviderDefinedModels",
			values: {
				providerDefinedManifestUrl: manifestUrl,
				providerDefinedApiKey: apiConfiguration?.providerDefinedApiKey,
				providerDefinedHeaders: apiConfiguration?.providerDefinedHeaders,
				forceRefresh: true,
			},
		})
	}, [
		apiConfiguration?.providerDefinedManifestUrl,
		apiConfiguration?.providerDefinedApiKey,
		apiConfiguration?.providerDefinedHeaders,
	])

	const onMessage = useCallback((event: MessageEvent) => {
		const message: ExtensionMessage = event.data

		switch (message.type) {
			case "providerDefinedModels":
				setIsFetching(false)
				setFetchError(undefined)
				setHasFetched(true)
				setModels(message.providerDefinedModels ?? {})
				setProviderName(message.providerDefinedManifest?.name)
				break
			case "singleRouterModelFetchResponse": {
				const providerKey = message.values?.provider
				if (providerKey === "provider-defined") {
					setIsFetching(false)
					setFetchError(message.error || "Failed to fetch models for the provided manifest.")
					setHasFetched(false)
					setModels({})
					setProviderName(undefined)
				}
				break
			}
		}
	}, [])

	useEvent("message", onMessage)

	useEffect(() => {
		if (!hasFetched) {
			return
		}

		const availableModels = Object.keys(models)
		if (availableModels.length === 0) {
			return
		}

		const selectedModel = apiConfiguration?.providerDefinedModelId
		if (!selectedModel || !models[selectedModel]) {
			const firstModel = availableModels[0]
			setApiConfigurationField("providerDefinedModelId", firstModel)
		}
	}, [hasFetched, models, apiConfiguration?.providerDefinedModelId, setApiConfigurationField])

	const sortedModelEntries = useMemo(() => Object.keys(models).sort((a, b) => a.localeCompare(b)), [models])

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2 items-end">
				<VSCodeTextField
					value={apiConfiguration?.providerDefinedManifestUrl || ""}
					onInput={handleInputChange("providerDefinedManifestUrl")}
					placeholder="https://api.example.com/v1/models?provider=true"
					className="flex-1">
					<label className="block font-medium mb-1">Manifest URL</label>
				</VSCodeTextField>
				<VSCodeButton appearance="primary" onClick={handleFetchModels} disabled={isFetching}>
					{isFetching ? "Fetching..." : "Fetch"}
				</VSCodeButton>
			</div>
			{fetchError && <div className="text-sm text-vscode-errorForeground">{fetchError}</div>}

			<VSCodeTextField
				value={apiConfiguration?.providerDefinedApiKey || ""}
				type="password"
				onInput={handleInputChange("providerDefinedApiKey")}
				placeholder="sk-..."
				className="w-full">
				<label className="block font-medium mb-1">API Key</label>
			</VSCodeTextField>

			{providerName && (
				<div className="text-sm text-vscode-descriptionForeground">Fetched provider: {providerName}</div>
			)}

			{hasFetched && (
				<div className="flex flex-col gap-2">
					<label className="block font-medium">Model</label>
					{sortedModelEntries.length > 0 ? (
						<VSCodeDropdown
							className="w-full"
							value={apiConfiguration?.providerDefinedModelId || ""}
							onChange={handleInputChange("providerDefinedModelId")}>
							{sortedModelEntries.map((modelId) => (
								<VSCodeOption key={modelId} value={modelId}>
									{modelId}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					) : (
						<div className="text-sm text-vscode-descriptionForeground">
							No models were returned for this provider.
						</div>
					)}
				</div>
			)}
		</div>
	)
}
