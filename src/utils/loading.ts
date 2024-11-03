export class LoadingIndicator {
  private static instance: LoadingIndicator | null = null
  private originalButtonContent: string | null = null
  private originalButton: HTMLButtonElement | null = null

  private constructor() {}

  public static getInstance(): LoadingIndicator {
    if (!LoadingIndicator.instance) {
      LoadingIndicator.instance = new LoadingIndicator()
    }
    return LoadingIndicator.instance
  }

  private findSubmitButton(): HTMLButtonElement | null {
    return document.querySelector('button[aria-label="Send Message"]')
  }

  private createLoadingSpinner(): string {
    // Using the same styling as Claude's button but with spinning animation
    return `
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <circle class="opacity-25" cx="128" cy="128" r="96" stroke="currentColor" stroke-width="16" fill="none"></circle>
        <path class="opacity-75" fill="currentColor" d="M128 32a96 96 0 0 1 96 96h-16a80 80 0 0 0-80-80V32z"></path>
      </svg>
    `
  }

  private addStyles() {
    const styleId = 'jina-reader-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `
      document.head.appendChild(style)
    }
  }

  public show(): void {
    this.addStyles()
    const button = this.findSubmitButton()

    if (button && !this.originalButton) {
      this.originalButton = button
      this.originalButtonContent = button.innerHTML

      // Add loading state classes
      button.classList.add('loading')
      button.setAttribute('disabled', 'true')

      // Replace content with spinner
      button.innerHTML = this.createLoadingSpinner()
    }
  }

  public hide(): void {
    if (this.originalButton && this.originalButtonContent) {
      // Restore original state
      this.originalButton.classList.remove('loading')
      this.originalButton.removeAttribute('disabled')
      this.originalButton.innerHTML = this.originalButtonContent

      // Reset stored references
      this.originalButton = null
      this.originalButtonContent = null
    }
  }

  public cleanup(): void {
    this.hide()
    LoadingIndicator.instance = null
  }
}
