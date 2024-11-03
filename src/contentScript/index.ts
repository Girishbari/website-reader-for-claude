import { processUrlWithJinaReader } from '../utils/jina'
import { simulateAttachment } from '../utils/claude'
import { LoadingIndicator } from '../utils/loading'

console.log('URL to Claude: Extension loaded')

// State management
let lastProcessedUrls = new Set<string>()
let isProcessing = false
let attachedElements = new WeakSet()
let processingTimeout: number | null = null
let lastPasteTime = 0
let mainObserver: MutationObserver | null = null
let navigationObserver: MutationObserver | null = null

// Constants
const TYPING_DEBOUNCE_MS = 500
const PASTE_DEBOUNCE_MS = 1000
const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi

const isValidDomain = async (domain: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}`)
    const data = await response.json()
    return (
      response.ok && data.Status === 0 && (data.Answer?.length > 0 || data.Authority?.length > 0)
    )
  } catch {
    return false
  }
}

const normalizeUrl = (url: string): string => {
  // Remove whitespace and normalize the URL
  url = url.trim()

  // Add https:// if no protocol is present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  try {
    // Parse and reconstruct the URL to ensure consistency
    const urlObj = new URL(url)
    return urlObj.toString()
  } catch {
    return url
  }
}

const extractBaseUrl = (url: string): string => {
  try {
    const normalized = normalizeUrl(url)
    const urlObj = new URL(normalized)
    return `${urlObj.protocol}//${urlObj.hostname}`
  } catch {
    return url
  }
}

const isValidUrl = async (urlString: string): Promise<boolean> => {
  try {
    const normalizedUrl = normalizeUrl(urlString)
    const url = new URL(normalizedUrl)

    // Basic URL structure validation
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false
    }

    if (!url.hostname.includes('.') || url.hostname.endsWith('.')) {
      return false
    }

    const parts = url.hostname.split('.')
    if (parts.length < 2 || parts.some((part) => part.length === 0)) {
      return false
    }

    // Validate the base domain
    return await isValidDomain(url.hostname)
  } catch {
    return false
  }
}

const findNewUrls = async (text: string): Promise<string[]> => {
  const matches = text.match(URL_REGEX) || []
  const validUrls: string[] = []
  const seenBaseUrls = new Set<string>()

  for (const url of matches) {
    const normalizedUrl = normalizeUrl(url)
    const baseUrl = extractBaseUrl(url)

    // If we've already processed this base URL, skip it
    if (seenBaseUrls.has(baseUrl)) {
      continue
    }

    // If we've already processed this exact URL, skip it
    if (lastProcessedUrls.has(normalizedUrl)) {
      continue
    }

    // Check if this URL extends a previously processed one
    const isExtensionOfProcessed = Array.from(lastProcessedUrls).some(
      (processedUrl) =>
        normalizedUrl.startsWith(processedUrl) || processedUrl.startsWith(normalizedUrl),
    )

    if (!isExtensionOfProcessed && (await isValidUrl(url))) {
      validUrls.push(normalizedUrl)
      seenBaseUrls.add(baseUrl)
    }
  }

  return validUrls
}

const processUrls = async (urls: string[], element: HTMLElement): Promise<void> => {
  if (urls.length === 0 || isProcessing) return

  const loader = LoadingIndicator.getInstance()

  try {
    isProcessing = true
    loader.show()

    for (const url of urls) {
      if (!lastProcessedUrls.has(url)) {
        console.log('Processing URL:', url)
        const content = await processUrlWithJinaReader(url)
        if (content) {
          await simulateAttachment(element, content)
          lastProcessedUrls.add(url)

          // Store the base URL to prevent processing variations
          const baseUrl = extractBaseUrl(url)
          lastProcessedUrls.add(baseUrl)
        }
      }
    }
  } catch (error) {
    console.error('Error processing URLs:', error)
  } finally {
    isProcessing = false
    loader.hide()
  }
}

const processTextArea = async (element: HTMLElement | null, isPaste = false) => {
  if (!element) return

  if (isPaste) {
    const now = Date.now()
    if (now - lastPasteTime < PASTE_DEBOUNCE_MS) {
      return
    }
    lastPasteTime = now
  }

  const text = element instanceof HTMLTextAreaElement ? element.value : element.textContent || ''
  const newUrls = await findNewUrls(text)

  if (newUrls.length > 0) {
    await processUrls(newUrls, element)
  }
}

const attachEventListeners = (element: HTMLElement) => {
  if (attachedElements.has(element)) return

  console.log('Attaching event listeners to new element')

  function createEventListener(handler: Function) {
    return function (event: Event) {
      try {
        handler(event)
      } catch (error) {
        console.error('Event handler error:', error)
      }
    }
  }

  const handleInput = createEventListener((event: Event) => {
    if (event.type === 'input' && Date.now() - lastPasteTime < PASTE_DEBOUNCE_MS) {
      return
    }

    if (processingTimeout) {
      window.clearTimeout(processingTimeout)
    }

    processingTimeout = window.setTimeout(() => {
      processTextArea(element, false)
    }, TYPING_DEBOUNCE_MS)
  })

  const handlePaste = createEventListener((event: ClipboardEvent) => {
    setTimeout(() => {
      processTextArea(element, true)
    }, 100)
  })

  const handleKeyup = createEventListener((event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      if (Date.now() - lastPasteTime < PASTE_DEBOUNCE_MS) {
        return
      }
      processTextArea(element, false)
    }
  })

  // Remove any existing listeners before adding new ones
  element.removeEventListener('input', handleInput)
  element.removeEventListener('paste', handlePaste)
  element.removeEventListener('keyup', handleKeyup)

  // Add listeners
  element.addEventListener('input', handleInput, { passive: true })
  element.addEventListener('paste', handlePaste)
  element.addEventListener('keyup', handleKeyup, { passive: true })

  attachedElements.add(element)
}
const findInputElement = (): HTMLElement | null => {
  return (
    document.querySelector('.ProseMirror') ||
    document.querySelector('[role="textbox"]') ||
    document.querySelector('textarea')
  )
}

const setupObserver = () => {
  // Clear any existing observers
  if (mainObserver) {
    mainObserver.disconnect()
  }
  if (navigationObserver) {
    navigationObserver.disconnect()
  }

  // Set up the main observer for dynamic elements
  mainObserver = new MutationObserver((mutations) => {
    const inputElement = findInputElement()
    if (inputElement && !attachedElements.has(inputElement)) {
      attachEventListeners(inputElement)
    }
  })

  // Watch for DOM changes
  mainObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  })

  // Set up navigation observer
  let lastUrl = location.href
  navigationObserver = new MutationObserver(() => {
    const url = location.href
    if (url !== lastUrl) {
      lastUrl = url
      console.log('URL changed, re-initializing...')
      reinitialize()
    }
  })

  navigationObserver.observe(document, { subtree: true, childList: true })

  // Initial element check
  const inputElement = findInputElement()
  if (inputElement) {
    attachEventListeners(inputElement)
  }
}

const reinitialize = () => {
  cleanup()
  lastProcessedUrls.clear()
  attachedElements = new WeakSet()
  setupObserver()
}

// Cleanup function
const cleanup = () => {
  if (processingTimeout) {
    window.clearTimeout(processingTimeout)
  }

  if (mainObserver) {
    mainObserver.disconnect()
  }

  if (navigationObserver) {
    navigationObserver.disconnect()
  }

  LoadingIndicator.getInstance().cleanup()
}

// Periodic reinitialization to ensure listeners are active
setInterval(() => {
  const inputElement = findInputElement()
  if (inputElement && !attachedElements.has(inputElement)) {
    console.log('Periodic check: reattaching event listeners')
    attachEventListeners(inputElement)
  }
}, 5000)

// Initialize extension
setupObserver()

// Handle extension unload
window.addEventListener('unload', cleanup)

// Handle potential errors that might stop event listeners
window.addEventListener('error', (error) => {
  console.error('Global error caught:', error)
  reinitialize()
})

window.addEventListener('rejectionhandled', (event) => {
  console.error('Unhandled promise rejection:', event)
  reinitialize()
})
