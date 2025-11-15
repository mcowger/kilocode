import * as vscode from "vscode"

export type LogFunction = (...args: unknown[]) => void

/**
 * Creates a logging function that writes to a VSCode output channel
 * Based on the outputChannelLog implementation from src/extension/api.ts
 */
export function createOutputChannelLogger(outputChannel: vscode.OutputChannel): LogFunction {
	return (...args: unknown[]) => {
		for (const arg of args) {
			if (arg === null) {
				outputChannel.appendLine("null")
			} else if (arg === undefined) {
				outputChannel.appendLine("undefined")
			} else if (typeof arg === "string") {
				outputChannel.appendLine(arg)
			} else if (arg instanceof Error) {
				outputChannel.appendLine(`Error: ${arg.message}\n${arg.stack || ""}`)
			} else {
				try {
					outputChannel.appendLine(
						JSON.stringify(
							arg,
							(key, value) => {
								if (typeof value === "bigint") return `BigInt(${value})`
								if (typeof value === "function") return `Function: ${value.name || "anonymous"}`
								if (typeof value === "symbol") return value.toString()
								return value
							},
							2,
						),
					)
				} catch (error) {
					outputChannel.appendLine(`[Non-serializable object: ${Object.prototype.toString.call(arg)}]`)
				}
			}
		}
	}
}

/**
 * Creates a logging function that logs to both the output channel and console
 * Following the pattern from src/extension/api.ts
 */
export function createDualLogger(outputChannelLog: LogFunction): LogFunction {
	return (...args: unknown[]) => {
		outputChannelLog(...args)
		console.log(...args)
	}
}

export function createDualDebugLogger(outputChannelLog: LogFunction): LogFunction {
	return (...args: unknown[]) => {
		const debugMode = vscode.workspace.getConfiguration("kilo-code").get<boolean>("debugMode") ?? false
		if (debugMode) {
			outputChannelLog(...args)
			console.debug(...args)
		}
		// If debugMode is false, do nothing (implicit return)
	}
}

/**
 * DebugLogger class that creates and exports a singleton logger
 * Using createDualDebugLogger() for conditional dual output to both output channel and console
 */
class DebugLogger {
	private static instance: LogFunction

	private constructor() {}

	public static getLogger(): LogFunction {
		if (!DebugLogger.instance) {
			const outputChannel = vscode.window.createOutputChannel("Debug Logger")
			const outputChannelLogger = createOutputChannelLogger(outputChannel)
			DebugLogger.instance = createDualDebugLogger(outputChannelLogger)
		}
		return DebugLogger.instance
	}
}

export const debugLogger = DebugLogger.getLogger()
