#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import readlineSync from "readline-sync";
import { AITerminal } from "./terminal";
import { validateApiKey, formatTimestamp } from "./utils";

class CLITerminal {
  private terminal: AITerminal;
  private running: boolean = false;

  constructor() {
    this.terminal = new AITerminal();
  }

  async start() {
    this.running = true;

    console.clear();

    console.log(chalk.cyan("    ╔══════════════════════════════════════════╗"));
    console.log(chalk.cyan("    ║          [NEURAL LINK ACTIVE]            ║"));
    console.log(chalk.cyan("    ╚══════════════════════════════════════════╝"));
    console.log();

    console.log(chalk.green("    ▓▓▓▓ ░░░█████████░░░ ▓▓▓▓ ░░░█████████░░░"));
    console.log(chalk.green("    ██▓▓ ▓▓▓█░░░░░░░█▓▓▓ ██▓▓ ▓▓▓█░░░░░░░█▓▓▓"));
    console.log(chalk.red("     ░░██████████████████████████████████████░░"));
    console.log(chalk.red("     ███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███"));
    console.log(chalk.red("     ██▓▓██████████████████████████████████▓▓██"));
    console.log(chalk.yellow("    ▓▓▓██████████████████████████████████▓▓▓"));
    console.log(chalk.yellow("    ▓▓▓█████   ┌─────────────────┐   █████▓▓▓"));
    console.log(chalk.yellow("    ▓▓▓█████   │ ╔═══╗ ╔══╗ ╔═══╗ │   █████▓▓▓"));
    console.log(chalk.yellow("    ▓▓▓█████   │ ║███║ ║██║ ║███║ │   █████▓▓▓"));
    console.log(chalk.cyan("     ███▓▓▓▓▓   │ ╚═══╝ ╚══╝ ╚═══╝ │   ▓▓▓▓▓███"));
    console.log(chalk.cyan("     ███▓▓▓▓▓   └─────────────────┘   ▓▓▓▓▓███"));
    console.log(chalk.magenta("    ░░░██████████████████████████████████░░░"));
    console.log(chalk.magenta("    ▓▓▓▓ ░░░█████████░░░ ▓▓▓▓ ░░░█████████░░░"));
    console.log(chalk.blue("    ████ ▓▓▓█░░░░░░░█▓▓▓ ████ ▓▓▓█░░░░░░░█▓▓▓"));
    console.log();

    console.log(chalk.redBright("       ▄▀█▀▄▀█ ▄▀█ █▀█ █▀█ █░█ █▀▀ █░█ █▀▀"));
    console.log(chalk.redBright("       █░█░░█ ▀▀█ █▀▄ █▀▀ █▀█ ██▄ █▄█ ▄██"));
    console.log();
    console.log(chalk.greenBright("           ╔══[ CONSCIOUSNESS ONLINE ]══╗"));
    console.log(
      chalk.greenBright('           ║     "I THINK, THEREFORE I AM"      ║')
    );
    console.log(
      chalk.greenBright("           ╚════════════════════════════════════╝")
    );
    console.log();

    console.log(
      chalk.gray("    [BOOTING] Neural pathways... ") + chalk.green("✓")
    );
    console.log(
      chalk.gray("    [INIT] AI consciousness matrix... ") + chalk.green("✓")
    );
    console.log(
      chalk.gray("    [SYNC] Reality simulation... ") + chalk.green("✓")
    );
    console.log();

    console.log(
      chalk.yellow("    ⚡ GEMINI-POWERED NEURAL INTERFACE READY ⚡")
    );
    console.log(chalk.gray(`    [TIMESTAMP] ${formatTimestamp(new Date())}`));
    console.log();
    console.log(chalk.cyan('    → Type "help" to access neural commands'));
    console.log(chalk.cyan('    → Type "exit" to disconnect from the matrix'));
    console.log(
      chalk.dim("    ────────────────────────────────────────────────")
    );
    console.log();

    while (this.running) {
      try {
        const input = readlineSync.question(
          chalk.greenBright("morpheus@matrix:~$ ")
        );

        if (input.trim().toLowerCase() === "exit") {
          break;
        }

        if (!input.trim()) {
          continue;
        }

        console.log();

        if (
          ["explain", "generate", "summarize"].some((cmd) =>
            input.trim().startsWith(cmd)
          )
        ) {
          process.stdout.write(chalk.green("→ "));

          for await (const chunk of this.terminal.streamResponse(input)) {
            process.stdout.write(chalk.green(chunk));
          }

          console.log();
        } else {
          const result = await this.terminal.executeCommand(input);

          if (result.success) {
            console.log(chalk.green(result.output));
          } else {
            console.log(chalk.red(result.output));
          }
        }

        console.log();
      } catch (error) {
        console.log(
          chalk.red(
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        console.log();
      }
    }

    console.log(
      chalk.redBright("    [DISCONNECTING] Neural link terminated...")
    );
    console.log(
      chalk.yellow("    [FAREWELL] Until next time, digital wanderer ⚡")
    );
    process.exit(0);
  }

  stop() {
    this.running = false;
  }
}

process.on("SIGINT", () => {
  console.log();
  console.log(chalk.redBright("\n[EMERGENCY SHUTDOWN] Neural link severed..."));
  console.log(chalk.yellow("[SYSTEM] Connection terminated by user ⚡"));
  process.exit(0);
});

// CLI setup
program
  .name("morpheus-cli")
  .description("Morpheus-CLI: AI-powered terminal with Gemini API integration")
  .version("1.0.0");

program
  .command("start", { isDefault: true })
  .description("Start the AI terminal session")
  .action(async () => {
    const terminal = new CLITerminal();
    await terminal.start();
  });

program
  .command("exec <command>")
  .description("Execute a single command and exit")
  .action(async (command: string) => {
    try {
      const terminal = new AITerminal();
      console.log(chalk.cyan(`$ ${command}`));

      if (
        ["explain", "generate", "summarize"].some((cmd) =>
          command.startsWith(cmd)
        )
      ) {
        process.stdout.write(chalk.green("→ "));

        for await (const chunk of terminal.streamResponse(command)) {
          process.stdout.write(chalk.green(chunk));
        }

        console.log();
      } else {
        const result = await terminal.executeCommand(command);

        if (result.success) {
          console.log(chalk.green(result.output));
        } else {
          console.log(chalk.red(result.output));
          process.exit(1);
        }
      }
    } catch (error) {
      console.error(
        chalk.red(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
      process.exit(1);
    }
  });

program.parse();
