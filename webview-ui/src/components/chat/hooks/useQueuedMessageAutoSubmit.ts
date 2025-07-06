import { useEffect, useRef } from "react"

interface UseQueuedMessageAutoSubmitProps {
	sendingDisabled: boolean
	hasQueuedMessage: boolean
	inputValue: string
	selectedImages: string[]
	onAutoSubmit: (message: string, images: string[]) => void
	clearQueuedState: () => void
}

/**
 * Custom hook to handle auto-submission of queued messages when agent becomes idle.
 * Monitors sendingDisabled state and triggers auto-submit with current input value.
 */
export function useQueuedMessageAutoSubmit({
	sendingDisabled,
	hasQueuedMessage,
	inputValue,
	selectedImages,
	onAutoSubmit,
	clearQueuedState,
}: UseQueuedMessageAutoSubmitProps) {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const prevSendingDisabledRef = useRef(sendingDisabled)

	useEffect(() => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}

		const justBecameIdle = prevSendingDisabledRef.current === true && sendingDisabled === false

		// Update previous state for next comparison
		prevSendingDisabledRef.current = sendingDisabled

		// Only proceed if agent just became idle and we have a queued message
		if (justBecameIdle && hasQueuedMessage) {
			timeoutRef.current = setTimeout(() => {
				// Submit whatever is currently in the input box
				if (hasQueuedMessage && !sendingDisabled) {
					const trimmedInput = inputValue.trim()
					if (trimmedInput || selectedImages.length > 0) {
						onAutoSubmit(trimmedInput, selectedImages)
						clearQueuedState()
					}
				}

				timeoutRef.current = null
			}, 500)
		}

		// Cleanup function
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
		}
	}, [sendingDisabled, hasQueuedMessage, inputValue, selectedImages, onAutoSubmit, clearQueuedState])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])
}
