export interface TerminalConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface HistoryItem {
  command: string;
  output: string;
  timestamp: Date;
}

export class TerminalHistory {
  private history: HistoryItem[] = [];
  private currentIndex = -1;

  add(command: string, output: string): void {
    this.history.push({
      command,
      output,
      timestamp: new Date(),
    });
    this.currentIndex = this.history.length;
  }

  getPrevious(): string | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex].command;
    }
    return null;
  }

  getNext(): string | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex].command;
    }
    this.currentIndex = this.history.length;
    return "";
  }

  getAll(): HistoryItem[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const validateApiKey = (apiKey?: string): boolean => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  return typeof key === "string" && key.length > 0;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[\r\n]+/g, " ");
};

export const parseCommand = (
  input: string
): { command: string; args: string } => {
  const trimmed = sanitizeInput(input);
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return { command: trimmed.toLowerCase(), args: "" };
  }

  return {
    command: trimmed.substring(0, spaceIndex).toLowerCase(),
    args: trimmed.substring(spaceIndex + 1).trim(),
  };
};
