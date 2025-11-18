import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { spawn } from "child_process";
import readlineSync from "readline-sync";
import chalk from "chalk";
import {
  TerminalConfig,
  CommandResult,
  TerminalHistory,
  parseCommand,
  validateApiKey,
} from "./utils";

export class AITerminal {
  private genAI?: GoogleGenerativeAI;
  private model?: GenerativeModel;
  private history: TerminalHistory;
  private config: TerminalConfig;

  constructor(config: TerminalConfig = {}) {
    this.config = config;
    this.history = new TerminalHistory();

    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    if (apiKey && validateApiKey(apiKey)) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: config.model || "gemini-2.5-flash",
        generationConfig: {
          temperature: config.temperature || 0.7,
        },
      });
    }
  }

  async executeCommand(input: string): Promise<CommandResult> {
    const { command, args } = parseCommand(input);
    const fullCommand = input.trim();

    try {
      let result: CommandResult;

      // Check if it's a built-in AI/terminal command
      switch (command) {
        case "help":
          result = this.handleHelp();
          break;
        case "explain":
        case "generate":
        case "summarize":
          if (!this.model) {
            const apiKey = await this.promptForApiKey();
            if (!apiKey) {
              return {
                success: false,
                output: chalk.yellow(
                  "⚠️  AI features require a valid Gemini API key. Shell commands will continue to work normally."
                ),
                error: "No API key",
              };
            }
            this.setupAI(apiKey);
          }
          result = await this.handleAICommand(command, args);
          break;
        case "vision":
          if (!this.model) {
            const apiKey = await this.promptForApiKey();
            if (!apiKey) {
              return {
                success: false,
                output: chalk.yellow(
                  "⚠️  AI features require a valid Gemini API key. Shell commands will continue to work normally."
                ),
                error: "No API key",
              };
            }
            this.setupAI(apiKey);
          }
          result = await this.handleVision(args);
          break;
        case "clear":
          result = this.handleClear();
          break;
        case "":
          result = { success: true, output: "" };
          break;
        default:
          // Execute as shell command
          result = await this.executeShellCommand(fullCommand);
          break;
      }

      if (result.success && result.output) {
        this.history.add(fullCommand, result.output);
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        output: `Error: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }

  private handleHelp(): CommandResult {
    const helpText = `
AI Terminal - Hybrid Shell + AI Assistant

🤖 AI Commands:
• explain <text>       - Get AI explanation of any text or concept
• generate <request>   - Generate code, text, or solutions
• summarize <text>     - Summarize long text or content
• vision <image_path>  - Analyze images (describe, extract text, etc.)
• clear               - Clear terminal output
• help                - Show this help message

💻 Shell Commands:
• Any regular terminal command (ls, cd, git, npm, etc.)
• Full shell functionality with AI assistance

Examples:
• ls -la
• git status
• explain "what is machine learning"
• generate "a Python function to sort an array"
• npm install express

Note: AI features will prompt for Gemini API key if not set.
`;

    return { success: true, output: helpText };
  }

  private async handleExplain(text: string): Promise<CommandResult> {
    if (!text) {
      return {
        success: false,
        output: "Please provide text to explain. Usage: explain <text>",
        error: "Missing text",
      };
    }

    const prompt = `Explain this in 2-3 lines max, concise and technical:\n\n${text}`;
    return await this.callGeminiAPI(prompt);
  }

  private async handleGenerate(request: string): Promise<CommandResult> {
    if (!request) {
      return {
        success: false,
        output:
          "Please provide a generation request. Usage: generate <request>",
        error: "Missing request",
      };
    }

    const prompt = `Generate clean code only, no explanations unless essential. Keep it minimal:\n\n${request}`;
    return await this.callGeminiAPI(prompt);
  }

  private async handleSummarize(text: string): Promise<CommandResult> {
    if (!text) {
      return {
        success: false,
        output: "Please provide text to summarize. Usage: summarize <text>",
        error: "Missing text",
      };
    }

    const prompt = `Summarize in 2-3 lines max, key points only:\n\n${text}`;
    return await this.callGeminiAPI(prompt);
  }

  private async handleVision(imagePath: string): Promise<CommandResult> {
    if (!imagePath) {
      return {
        success: false,
        output: "Please provide an image path. Usage: vision <image_path>",
        error: "Missing image path",
      };
    }

    try {
      const fs = require("fs");
      const path = require("path");

      if (!fs.existsSync(imagePath)) {
        return {
          success: false,
          output: `Image file not found: ${imagePath}`,
          error: "File not found",
        };
      }

      const imageData = fs.readFileSync(imagePath);
      const mimeType = this.getMimeType(path.extname(imagePath));

      if (!this.genAI) {
        return {
          success: false,
          output: "AI not initialized",
          error: "No API key",
        };
      }

      const visionModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt =
        "Analyze this image and provide: 1) A detailed description, 2) Any text you can extract, 3) Technical details if it's a diagram/code/screenshot";

      const result = await visionModel.generateContent([
        {
          inlineData: {
            data: imageData.toString("base64"),
            mimeType,
          },
        },
        prompt,
      ]);

      const response = await result.response;
      const output = response.text();

      return { success: true, output };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Vision analysis failed";
      return {
        success: false,
        output: `Vision error: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }

  private handleClear(): CommandResult {
    this.history.clear();
    return { success: true, output: "Terminal cleared." };
  }

  private async callGeminiAPI(prompt: string): Promise<CommandResult> {
    try {
      if (!this.model) {
        return {
          success: false,
          output: "AI not initialized. Use an AI command to set up API key.",
          error: "No API key",
        };
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const output = response.text();

      return { success: true, output };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "API call failed";
      return {
        success: false,
        output: `AI Error: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    return mimeTypes[extension.toLowerCase()] || "image/jpeg";
  }

  public async *streamResponse(
    input: string
  ): AsyncGenerator<string, void, unknown> {
    const { command, args } = parseCommand(input);

    if (!["explain", "generate", "summarize"].includes(command)) {
      const result = await this.executeCommand(input);
      yield result.output;
      return;
    }

    try {
      if (!this.model) {
        yield "Error: AI not initialized. Use an AI command to set up API key.";
        return;
      }

      let prompt = "";
      switch (command) {
        case "explain":
          prompt = `Explain this in 2-3 lines max, concise and technical:\n\n${args}`;
          break;
        case "generate":
          prompt = `Generate clean code only, no explanations unless essential. Keep it minimal:\n\n${args}`;
          break;
        case "summarize":
          prompt = `Summarize in 2-3 lines max, key points only:\n\n${args}`;
          break;
      }

      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    } catch (error) {
      yield `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  public getHistory(): TerminalHistory {
    return this.history;
  }

  private async executeShellCommand(command: string): Promise<CommandResult> {
    return new Promise((resolve) => {
      const process = spawn("sh", ["-c", command], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      let output = "";
      let error = "";

      process.stdout.on("data", (data: Buffer) => {
        output += data.toString();
      });

      process.stderr.on("data", (data: Buffer) => {
        error += data.toString();
      });

      process.on("close", (code: number) => {
        if (code === 0) {
          resolve({
            success: true,
            output: output.trim() || "Command executed successfully",
          });
        } else {
          resolve({
            success: false,
            output: error.trim() || `Command failed with code ${code}`,
            error: error.trim(),
          });
        }
      });

      process.on("error", (err: Error) => {
        resolve({
          success: false,
          output: `Error: ${err.message}`,
          error: err.message,
        });
      });
    });
  }

  private async promptForApiKey(): Promise<string | null> {
    console.log(chalk.yellow("\n🤖 AI features require Gemini API key"));
    console.log(
      chalk.gray("Get one free at: https://aistudio.google.com/app/api-keys")
    );
    console.log(
      chalk.gray("Your API key will be saved for this session only.")
    );
    console.log();

    const apiKey = readlineSync.question(
      chalk.cyan("Enter your Gemini API key (hidden): "),
      {
        hideEchoBack: true,
      }
    );

    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      console.log(
        chalk.red("❌ No API key provided. AI features will be disabled.")
      );
      return null;
    }

    if (trimmedKey.length < 20) {
      console.log(
        chalk.red(
          "❌ Invalid API key format. Please check your key and try again."
        )
      );
      return null;
    }

    console.log(
      chalk.green("✅ API key set successfully! AI features are now available.")
    );
    return trimmedKey;
  }

  private setupAI(apiKey: string): void {
    // Set API key in environment variables for this session
    process.env.GEMINI_API_KEY = apiKey;

    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model || "gemini-2.5-flash",
      generationConfig: {
        temperature: this.config.temperature || 0.7,
      },
    });

    console.log(chalk.dim("🔗 Connected to Gemini AI service"));
  }

  private async handleAICommand(
    command: string,
    args: string
  ): Promise<CommandResult> {
    switch (command) {
      case "explain":
        return await this.handleExplain(args);
      case "generate":
        return await this.handleGenerate(args);
      case "summarize":
        return await this.handleSummarize(args);
      default:
        return {
          success: false,
          output: "Unknown AI command",
          error: "Unknown command",
        };
    }
  }
}
