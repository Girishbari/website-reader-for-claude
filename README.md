# Website Reader for Claude

<div align="center">

![Website Reader for Claude](/public/img/logo-128.png)

![Demo of Website Reader for Claude](/public/screenshots/demo.gif)

A Chrome extension that automatically extracts webpage content when sharing URLs with Claude, enabling deeper conversations and better analysis.

[Install from Chrome Store](https://chromewebstore.google.com/detail/website-reader-for-claude/jolimpecpmladpnpipohidkbcodngkpn) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

## 🌟 Features

- **Automatic Content Extraction**: Website content will be automatically extracted (with Jina.ai Reader)
- **Simple to Use**: Just paste any URL into your Claude conversation
- **Works Instantly**: Content is automatically attached to your message
- **Clean Formatting**: Content comes through perfectly formatted for Claude
- **Privacy Focused**: All processing is secure and private
- **Zero Setup**: Works right after installation

## 🚀 Getting Started

### Installation

1. Install the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/website-reader-for-claude/jolimpecpmladpnpipohidkbcodngkpn)
2. Navigate to [claude.ai](https://claude.ai)
3. Start sharing URLs in your conversations!

### Usage

1. Open a conversation with Claude
2. Paste any URL into your message
3. The extension automatically:

- Extracts the webpage content (using Jina.ai Reader)
- Attaches it to your message
- No extra steps needed

4. Claude can now understand and discuss the complete webpage

## 🔒 Privacy

- All content extraction is handled securely
- No content is stored or saved
- No tracking or analytics included
- No personal data is collected

## ⚡ How It Works

The extension uses Jina.ai Reader to:

- Extract the important content from any webpage
- Keep the formatting clean and organized
- Attach it directly to your conversation
- Make sure Claude can understand everything perfectly

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser

### Local Development

1. Clone the repository

```bash
git clone https://github.com/sgasser/website-reader-for-claude.git
cd website-reader-for-claude
```

2. Install dependencies

```bash
npm install
```

3. Build the extension

```bash
npm run build
```

4. Load the extension in Chrome:

- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `build` folder from the project

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ❤️ Acknowledgments

- Uses [Jina.ai Reader](https://jina.ai/reader) for website content extraction
- Sponsored by [MailWizard](https://mailwizard.ai) - Your AI Email Assistant
- Created by Stefan Gasser
- Built for the amazing Claude community

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
