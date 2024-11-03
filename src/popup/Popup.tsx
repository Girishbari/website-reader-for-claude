import React, { useEffect, useState } from 'react'

export const Popup = () => {
  const [status, setStatus] = useState('')
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // Check if we're on claude.ai
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      const isClaudeTab = currentTab.url ? currentTab.url.includes('claude.ai') : false
      setIsActive(isClaudeTab)
      setStatus(
        isClaudeTab
          ? '✨ Active and ready to extract website content'
          : '⚠️ Please navigate to claude.ai to use this extension',
      )
    })
  }, [])

  return (
    <div className="min-w-[320px] font-sans bg-white dark:bg-gray-900 dark:text-white">
      <div className="w-full p-4">
        <h1 className="text-xl font-bold mb-3">Website Reader for Claude</h1>

        <div
          className={`mb-4 py-2 text-sm ${isActive ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}
        >
          {status}
        </div>

        {isActive && (
          <div className="mb-4">
            <h2 className="font-bold mb-2 text-base">How it works:</h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              <li>Paste any URL into your Claude conversation</li>
              <li>Website content will be automatically extracted (with Jina.ai Reader)</li>
              <li>The content is attached to your chat message</li>
              <li>Claude can now understand and discuss the webpage</li>
            </ol>
          </div>
        )}

        <div className="space-y-1.5 text-sm mt-4">
          <p>
            <a
              href="https://github.com/sgasser/website-reader-for-claude"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center dark:text-blue-400"
            >
              View on GitHub
              <span className="ml-0.5">↗</span>
            </a>
          </p>
          <p>
            Sponsored by{' '}
            <a
              href="https://mailwizard.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center dark:text-blue-400"
            >
              MailWizard
              <span className="ml-0.5">↗</span>
            </a>
          </p>
          <p className="text-gray-500 dark:text-gray-400">Works exclusively on claude.ai</p>
        </div>
      </div>
    </div>
  )
}

export default Popup
