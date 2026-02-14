import axios from "axios"

import { DEFAULT_HEADERS } from "../constants"

export async function getAnthropicCompatibleModels(
	baseUrl?: string,
	apiKey?: string,
	useAuthToken?: boolean,
): Promise<string[]> {
	try {
		if (!baseUrl || !apiKey) {
			return []
		}

		const trimmedBaseUrl = baseUrl.trim()
		if (!URL.canParse(trimmedBaseUrl)) {
			return []
		}

		const urlObj = new URL(trimmedBaseUrl)
		const normalizedPath = urlObj.pathname.replace(/\/+$/, "")
		urlObj.pathname =
			normalizedPath === "/v1" || normalizedPath.endsWith("/v1")
				? `${normalizedPath}/models`
				: `${normalizedPath}/v1/models`

		const headers: Record<string, string> = {
			...DEFAULT_HEADERS,
			"Content-Type": "application/json",
		}

		if (useAuthToken) {
			headers["Authorization"] = `Bearer ${apiKey}`
		} else {
			headers["x-api-key"] = apiKey
		}

		const response = await axios.get(urlObj.toString(), { headers, timeout: 5000 })
		const models = response.data?.data

		if (!Array.isArray(models)) {
			return []
		}

		return [
			...new Set<string>(models.map((model: any) => model?.id).filter((id: unknown) => typeof id === "string")),
		]
	} catch {
		return []
	}
}
