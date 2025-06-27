#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { installCommand } from "./commands/install.js";
import { listCommand } from "./commands/list.js";
import { logger } from "./utils/logger.js";
import { getPackageVersion } from "./utils/package.js";

/**
 * The main CLI application entry point.
 */
async function main() {
  const program = new Command();
  const version = await getPackageVersion();

  program
    .name("cmskit")
    .description("A powerful CLI for installing custom UI component packages")
    .version(version)
    .addHelpText(
      "after",
      `\n${chalk.gray(
        "Examples:"
      )}\n  $ cmskit install button\n  $ cmskit init\n  $ cmskit list`
    );

  // Add commands
  program.addCommand(installCommand());
  program.addCommand(initCommand());
  program.addCommand(listCommand());

  // Parse arguments
  program.parse();

  // Show help if no command provided
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

// Run the CLI
main().catch((error) => {
  logger.error("An unexpected error occurred:", error);
  process.exit(1);
});
