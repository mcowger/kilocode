// kilocode_change -- file added

import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"

import { inputEventTransform } from "../transforms"

type CodexProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const Codex = ({ apiConfiguration, setApiConfigurationField }: CodexProps) => {
	const { t } = useAppTranslation()

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

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.codexOAuthPath || ""}
				onInput={handleInputChange("codexOAuthPath")}
				placeholder="~/.codex/auth.json"
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.codex.oauthPath")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.codex.oauthPathDescription")}
			</div>

			<div className="text-sm text-vscode-descriptionForeground mt-3">
				{t("settings:providers.codex.description")}
			</div>

			<div className="text-sm text-vscode-descriptionForeground mt-2">
				{t("settings:providers.codex.instructions")}
			</div>

			<VSCodeLink
				href="https://github.com/openai/codex"
				className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground mt-2 inline-block">
				{t("settings:providers.codex.setupLink")}
			</VSCodeLink>
		</>
	)
}
