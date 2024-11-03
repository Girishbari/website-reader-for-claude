interface AttachmentMetadata {
  name: string
  type: string
  isAttachment: boolean
  size: number
  timestamp: number
  source: string
}

/**
 * Ensures content is at least 4000 characters to trigger Claude's attachment behavior
 */
const ensureMinimumLength = (content: string): string => {
  const MIN_LENGTH = 4000
  if (content.length >= MIN_LENGTH) {
    return content
  }
  return content + ' '.repeat(MIN_LENGTH - content.length)
}

export const simulateAttachment = async (
  element: HTMLElement,
  content: string,
): Promise<boolean> => {
  if (!element || !content) {
    console.error('Invalid element or content provided')
    return false
  }

  try {
    // Ensure minimum content length
    const paddedContent = ensureMinimumLength(content)

    const metadata: AttachmentMetadata = {
      name: 'jina-reader-content.txt',
      type: 'text/plain',
      isAttachment: true,
      size: content.length,
      timestamp: Date.now(),
      source: 'jina-reader',
    }

    // Create and initialize DataTransfer
    const dataTransfer = new DataTransfer()
    dataTransfer.setData('text/plain', paddedContent)
    dataTransfer.setData('application/json', JSON.stringify(metadata))

    // Create a file representation
    const file = new File([content], metadata.name, { type: metadata.type })
    dataTransfer.items.add(file)

    // Sequence of events for ProseMirror
    const events = [
      new FocusEvent('focus', { bubbles: true }),
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertFromPaste',
        data: content,
      }),
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer as unknown as DataTransfer,
      }),
      new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertFromPaste',
        data: content,
      }),
      new Event('change', { bubbles: true }),
    ]

    // Focus the element first
    if ('focus' in element) {
      element.focus()
    }

    // Dispatch all events in sequence
    for (const event of events) {
      const result = element.dispatchEvent(event)
      if (!result) {
        console.warn(`Event ${event.type} was cancelled`)
      }
    }

    return true
  } catch (error) {
    return false
  }
}
