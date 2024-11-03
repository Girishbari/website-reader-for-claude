interface JinaResponse {
  content?: string
  error?: string
  meta?: {
    url: string
    timestamp: string
  }
}

export const processUrlWithJinaReader = async (url: string): Promise<string | null> => {
  const TIMEOUT_MS = 10000
  const MAX_RETRIES = 2
  const RETRY_DELAY_MS = 1000

  const fetchWithTimeout = async (url: string): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      return await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'text/plain, application/json',
          'Cache-Control': 'no-cache',
        },
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const tryFetch = async (attempt: number = 0): Promise<string | null> => {
    try {
      console.log(`Fetching from Jina Reader (attempt ${attempt + 1}):`, url)
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`

      const response = await fetchWithTimeout(jinaUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const jsonData = (await response.json()) as JinaResponse
        if (jsonData.error) throw new Error(jsonData.error)
        return jsonData.content || null
      }

      return (await response.text()) || null
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out')
      }

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`)
        await delay(RETRY_DELAY_MS)
        return tryFetch(attempt + 1)
      }

      throw error
    }
  }

  try {
    return await tryFetch()
  } catch (error) {
    console.error('All attempts failed:', error)
    return null
  }
}
