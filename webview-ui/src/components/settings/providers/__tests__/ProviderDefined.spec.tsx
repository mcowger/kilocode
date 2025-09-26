import { render, screen, fireEvent, act, waitFor } from "@/utils/test-utils"

import type { ProviderSettings } from "@roo-code/types"

import { ProviderDefined } from "../ProviderDefined"

const mockPostMessage = vi.fn()

vi.mock("@src/utils/vscode", () => ({
	vscode: {
		postMessage: (...args: any[]) => mockPostMessage(...args),
	},
}))

vi.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeTextField: ({ children, value = "", onInput, type = "text", placeholder }: any) => (
		<div>
			{children}
			<input
				data-testid={placeholder || "text-field"}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(event) => onInput?.({ target: event.target })}
			/>
		</div>
	),
	VSCodeButton: ({ children, onClick, disabled }: any) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
	VSCodeDropdown: ({ children, value = "", onChange }: any) => (
		<select
			data-testid="provider-defined-model-dropdown"
			value={value}
			onChange={(event) => onChange?.({ target: event.target })}>
			{children}
		</select>
	),
	VSCodeOption: ({ children, value }: any) => <option value={value}>{children}</option>,
}))

describe("ProviderDefined settings", () => {
	const baseConfiguration = {
		providerDefinedManifestUrl: "",
		providerDefinedApiKey: "",
		providerDefinedModelId: "",
	} as ProviderSettings

	beforeEach(() => {
		mockPostMessage.mockClear()
	})

	it("shows an error if the user attempts to fetch without a manifest URL", () => {
		const setApiConfigurationField = vi.fn()

		render(
			<ProviderDefined
				apiConfiguration={baseConfiguration}
				setApiConfigurationField={setApiConfigurationField}
			/>,
		)

		fireEvent.click(screen.getByText("Fetch"))

		expect(screen.getByText("Manifest URL is required before fetching models.")).toBeInTheDocument()
		expect(mockPostMessage).not.toHaveBeenCalled()
	})

	it("sends a fetch request with manifest URL and API key", () => {
		const setApiConfigurationField = vi.fn()
		const configuration = {
			...baseConfiguration,
			providerDefinedManifestUrl: "https://example.com/v1/models?provider=true",
			providerDefinedApiKey: "test-key",
		} as ProviderSettings

		render(<ProviderDefined apiConfiguration={configuration} setApiConfigurationField={setApiConfigurationField} />)

		fireEvent.click(screen.getByText("Fetch"))

		expect(mockPostMessage).toHaveBeenCalledWith({
			type: "requestProviderDefinedModels",
			values: {
				providerDefinedManifestUrl: configuration.providerDefinedManifestUrl,
				providerDefinedApiKey: configuration.providerDefinedApiKey,
				providerDefinedHeaders: configuration.providerDefinedHeaders,
				forceRefresh: true,
			},
		})
	})

	it("populates models when a providerDefinedModels message is received", async () => {
		const setApiConfigurationField = vi.fn()
		const configuration = {
			...baseConfiguration,
			providerDefinedManifestUrl: "https://example.com/v1/models?provider=true",
		} as ProviderSettings

		render(<ProviderDefined apiConfiguration={configuration} setApiConfigurationField={setApiConfigurationField} />)

		// Dropdown is hidden before fetch results arrive
		expect(screen.queryByTestId("provider-defined-model-dropdown")).not.toBeInTheDocument()

		await act(async () => {
			window.dispatchEvent(
				new MessageEvent("message", {
					data: {
						type: "providerDefinedModels",
						providerDefinedModels: {
							"provider/model-a": {} as any,
							"provider/model-b": {} as any,
						},
						providerDefinedManifest: { name: "Test Provider" },
					},
				}),
			)
		})

		expect(await screen.findByText("Fetched provider: Test Provider")).toBeInTheDocument()

		const dropdown = await screen.findByTestId("provider-defined-model-dropdown")
		expect(dropdown).toBeInTheDocument()

		await waitFor(() => {
			expect(setApiConfigurationField).toHaveBeenCalledWith("providerDefinedModelId", "provider/model-a")
		})

		const options = screen.getAllByRole("option")
		expect(options.map((option) => option.getAttribute("value"))).toEqual(["provider/model-a", "provider/model-b"])
	})

	it("shows an error when the backend reports a failure", async () => {
		const setApiConfigurationField = vi.fn()
		const configuration = {
			...baseConfiguration,
			providerDefinedManifestUrl: "https://example.com/v1/models?provider=true",
		} as ProviderSettings

		render(<ProviderDefined apiConfiguration={configuration} setApiConfigurationField={setApiConfigurationField} />)

		fireEvent.click(screen.getByText("Fetch"))

		await act(async () => {
			window.dispatchEvent(
				new MessageEvent("message", {
					data: {
						type: "singleRouterModelFetchResponse",
						success: false,
						error: "Something went wrong",
						values: { provider: "provider-defined" },
					},
				}),
			)
		})

		expect(await screen.findByText("Something went wrong")).toBeInTheDocument()
	})
})
