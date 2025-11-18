# 🤖 Morpheus-CLI - The Matrix of Shell + AI

A powerful hybrid terminal that combines traditional shell functionality with AI assistance powered by Google's Gemini API. Like Morpheus offering the red pill, this CLI opens your mind to the possibilities of AI-enhanced terminal experience!

![Morpheus-CLI Demo](https://img.shields.io/badge/Morpheus--CLI-The%20Matrix%20Shell-red?style=for-the-badge&logo=matrix)

## 🚀 Quick Install & Start

```bash
# Install globally
npm install -g @aryainguz/morpheus-cli

# Enter the Matrix
morpheus-cli
# or use short alias
morpheus
```

## ✨ Features

- 🐧 **Full Shell Functionality** - All your regular terminal commands work (ls, git, npm, etc.)
- 🤖 **AI Assistant** - Get instant explanations, code generation, and text analysis
- 🔑 **Smart API Setup** - Prompts for Gemini API key only when needed
- ⚡ **Streaming Responses** - Real-time AI output for better UX
- 🎨 **Cyberpunk Interface** - Beautiful terminal with Matrix-style startup
- 📝 **Concise Outputs** - AI responses limited to 2-3 lines for efficiency
- 🔄 **Hybrid Mode** - Seamlessly switch between shell and AI commands

## 🛠 Usage

### Interactive Mode

```bash
morpheus-cli start
# or just
morpheus-cli
```

### Single Commands

```bash
# Shell commands
morpheus-cli exec "ls -la"
morpheus-cli exec "git status"
morpheus-cli exec "npm install express"

# AI commands
morpheus-cli exec "explain machine learning"
morpheus-cli exec "generate a Python sorting function"
morpheus-cli exec "summarize this code: function hello() { return 'world'; }"
```

### Available AI Commands

| Command               | Description                 | Example                                |
| --------------------- | --------------------------- | -------------------------------------- |
| `explain <text>`      | Get concise AI explanations | `explain recursion in programming`     |
| `generate <request>`  | Generate code or text       | `generate a React component for login` |
| `summarize <text>`    | Summarize content           | `summarize this documentation`         |
| `vision <image_path>` | Analyze images              | `vision ./screenshot.png`              |
| `help`                | Show all commands           | `help`                                 |
| `clear`               | Clear terminal              | `clear`                                |

## 🔧 API Key Setup

1. Get a free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. The terminal will prompt you when you first use AI commands
3. Or set it as environment variable: `export GEMINI_API_KEY="your-key-here"`

## 💻 Development

### Local Installation

```bash
git clone https://github.com/Aryainguz/refactor.git
cd morpheus-CLI
npm install
npm run build
```

### React Component Usage

```jsx
import { AITerminalUI } from "@aryainguz/morpheuscli";

function App() {
  return (
    <div className="h-screen bg-black">
      <AITerminalUI apiKey="your-gemini-key" />
    </div>
  );
}
```

### API Usage

```typescript
import { AITerminal } from "@aryainguz/morpheuscli";

const terminal = new AITerminal({
  apiKey: "your-key",
  temperature: 0.7,
});

const result = await terminal.executeCommand("explain TypeScript");
console.log(result.output);
```

## 📦 Package Structure

```
morpheus-cli/
├── src/
│   ├── cli.ts       # CLI interface
│   ├── terminal.ts  # Core AI terminal class
│   ├── ui.tsx       # React UI component
│   ├── utils.ts     # Utility functions
│   └── index.ts     # Main exports
├── dist/            # Compiled JavaScript
├── examples/        # Usage examples
└── README.md
```

## 🎯 Examples

### Shell + AI Workflow

```bash
# Check git status
git status

# Get AI explanation
explain "what does git rebase do?"

# Generate code
generate "a git hook for pre-commit linting"

# Install packages
npm install eslint

# Run commands
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT © [Aryainguz](https://github.com/Aryainguz)

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- Commander.js for CLI framework
- Chalk for beautiful terminal colors
- React and Framer Motion for smooth UI

---

**Made with ❤️ for developers who love both shell power and AI assistance!**
