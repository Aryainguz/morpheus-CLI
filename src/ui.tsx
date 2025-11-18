import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AITerminal } from "./terminal";
import { TerminalConfig, formatTimestamp } from "./utils";

interface TerminalLine {
  id: string;
  content: string;
  type: "input" | "output" | "error" | "system";
  timestamp: Date;
  streaming?: boolean;
}

interface AITerminalUIProps {
  config?: TerminalConfig;
  className?: string;
  height?: string;
  showTimestamp?: boolean;
  explainMode?: boolean;
}

export const AITerminalUI: React.FC<AITerminalUIProps> = ({
  config = {},
  className = "",
  height = "600px",
  showTimestamp = false,
  explainMode = false,
}) => {
  const [terminal, setTerminal] = useState<AITerminal | null>(null);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<TerminalLine[]>([]);

  // Keep lines ref updated
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  // Initialize terminal
  useEffect(() => {
    try {
      const terminalInstance = new AITerminal(config);
      setTerminal(terminalInstance);
      setLines([
        {
          id: "welcome",
          content: explainMode
            ? "AI Terminal (Explain Mode) - Commands will be explained instead of executed"
            : 'AI Terminal initialized. Type "help" for available commands.',
          type: "system",
          timestamp: new Date(),
        },
      ]);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize terminal";
      setError(errorMessage);
      setLines([
        {
          id: "error",
          content: `Error: ${errorMessage}`,
          type: "error",
          timestamp: new Date(),
        },
      ]);
    }
  }, [config, explainMode]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addLine = useCallback(
    (content: string, type: TerminalLine["type"], streaming = false) => {
      const newLine: TerminalLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        content,
        type,
        timestamp: new Date(),
        streaming,
      };

      setLines((prev) => [...prev, newLine]);
      return newLine.id;
    },
    []
  );

  const updateLine = useCallback(
    (id: string, content: string, streaming = false) => {
      setLines((prev) =>
        prev.map((line) =>
          line.id === id ? { ...line, content, streaming } : line
        )
      );
    },
    []
  );

  const executeCommand = useCallback(
    async (input: string) => {
      if (!terminal || !input.trim()) return;

      const trimmedInput = input.trim();

      // Add input line
      addLine(`$ ${trimmedInput}`, "input");

      if (explainMode) {
        // In explain mode, explain what the command would do
        setIsLoading(true);
        const explanation = await terminal.executeCommand(
          `explain "What would this command do: ${trimmedInput}"`
        );
        setIsLoading(false);
        addLine(explanation.output, explanation.success ? "output" : "error");
        return;
      }

      setIsLoading(true);

      try {
        // Handle streaming commands
        if (
          ["explain", "generate", "summarize"].some((cmd) =>
            trimmedInput.startsWith(cmd)
          )
        ) {
          const outputLineId = addLine("", "output", true);
          let accumulatedOutput = "";

          for await (const chunk of terminal.streamResponse(trimmedInput)) {
            accumulatedOutput += chunk;
            updateLine(outputLineId, accumulatedOutput, true);
            // Small delay for smooth streaming effect
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          updateLine(outputLineId, accumulatedOutput, false);
        } else {
          // Handle non-streaming commands
          const result = await terminal.executeCommand(trimmedInput);
          addLine(result.output, result.success ? "output" : "error");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Command execution failed";
        addLine(`Error: ${errorMessage}`, "error");
      }

      setIsLoading(false);
    },
    [terminal, explainMode, addLine, updateLine]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isLoading) {
        e.preventDefault();
        executeCommand(currentInput);
        setCurrentInput("");
        setHistoryIndex(-1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (terminal) {
          const history = terminal.getHistory().getAll();
          if (history.length > 0) {
            const newIndex =
              historyIndex === -1
                ? history.length - 1
                : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setCurrentInput(history[newIndex].command);
          }
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (terminal) {
          const history = terminal.getHistory().getAll();
          if (historyIndex >= 0) {
            const newIndex = historyIndex + 1;
            if (newIndex >= history.length) {
              setHistoryIndex(-1);
              setCurrentInput("");
            } else {
              setHistoryIndex(newIndex);
              setCurrentInput(history[newIndex].command);
            }
          }
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([
          {
            id: "clear",
            content: "Terminal cleared.",
            type: "system",
            timestamp: new Date(),
          },
        ]);
      }
    },
    [currentInput, isLoading, historyIndex, terminal, executeCommand]
  );

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input":
        return "text-cyan-400";
      case "output":
        return "text-green-300";
      case "error":
        return "text-red-400";
      case "system":
        return "text-yellow-300";
      default:
        return "text-gray-300";
    }
  };

  if (error) {
    return (
      <div
        className={`bg-red-900 border border-red-500 rounded p-4 text-red-200 ${className}`}
      >
        <h3 className="font-bold mb-2">Terminal Initialization Error</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">
          Make sure to set your GEMINI_API_KEY environment variable or pass it
          in the config prop.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-black border border-green-500 rounded-lg overflow-hidden font-mono text-sm ${className}`}
      style={{ height }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header */}
      <div className="bg-green-900/20 border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-green-400 text-xs font-bold tracking-wider">
          {explainMode ? "AI-TERMINAL [EXPLAIN-MODE]" : "AI-TERMINAL"}
        </div>
        <div className="text-green-400/60 text-xs">
          {formatTimestamp(new Date())}
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="p-4 overflow-y-auto flex-1"
        style={{ height: `calc(${height} - 60px)` }}
      >
        <AnimatePresence>
          {lines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`mb-2 ${getLineColor(line.type)}`}
            >
              <div className="flex items-start space-x-2">
                {showTimestamp && (
                  <span className="text-gray-500 text-xs min-w-[60px]">
                    {formatTimestamp(line.timestamp)}
                  </span>
                )}
                <div className="flex-1">
                  {line.type === "input" && (
                    <span className="text-green-400">→ </span>
                  )}
                  {line.streaming ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-pre-wrap"
                    >
                      {line.content}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="bg-green-400 ml-1"
                      >
                        ▋
                      </motion.span>
                    </motion.span>
                  ) : (
                    <span className="whitespace-pre-wrap">{line.content}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-yellow-300 mb-2"
          >
            <span className="animate-pulse">Processing...</span>
          </motion.div>
        )}

        {/* Input line */}
        <div className="flex items-center text-cyan-400">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="bg-transparent border-none outline-none flex-1 text-cyan-400 placeholder-gray-500"
            placeholder={isLoading ? "Processing..." : "Enter command..."}
            autoComplete="off"
            spellCheck={false}
          />
          {showCursor && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="bg-cyan-400 ml-1"
            >
              ▋
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
};
