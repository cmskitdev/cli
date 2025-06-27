import { confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { existsSync } from "fs";
import { join } from "path";
import { writeFile } from "../utils/file-system.js";
import { logger } from "../utils/logger.js";

/**
 * Creates the init command for setting up a project.
 *
 * @returns The configured init command.
 */
export function initCommand(): Command {
  const command = new Command("init")
    .description("Initialize CMSKit UI in your project")
    .option("--no-install", "skip dependency installation")
    .action(async (options) => {
      logger.info("Welcome to CMSKit UI! Let's set up your project.\n");

      try {
        // Check if already initialized
        const configPath = join(process.cwd(), "cmskit.config.json");
        if (existsSync(configPath)) {
          const overwrite = await confirm({
            message: "CMSKit is already initialized. Overwrite configuration?",
            default: false,
          });

          if (!overwrite) {
            logger.info("Initialization cancelled.");
            return;
          }
        }

        // Select component library preferences
        const styleSystem = await select({
          message: "Which styling system are you using?",
          choices: [
            { name: "Tailwind CSS", value: "tailwind" },
            { name: "CSS Modules", value: "css-modules" },
            { name: "Plain CSS", value: "css" },
            { name: "SCSS", value: "scss" },
          ],
        });

        const componentPath = await input({
          message: "Where should components be installed?",
          default: "src/lib/components",
        });

        // Create configuration
        const config = {
          version: "1.0.0",
          styling: styleSystem,
          paths: {
            components: componentPath,
          },
          registry: {
            url: "https://api.cmskit.dev",
          },
        };

        // Write configuration
        await writeFile(configPath, JSON.stringify(config, null, 2));
        logger.success("Created cmskit.config.json");

        // Install base dependencies
        if (options.install) {
          logger.info("\nInstalling dependencies...");
          // Implementation for dependency installation
        }

        logger.success("\n✨ CMSKit UI initialized successfully!");
        logger.info("\nNext steps:");
        logger.info(
          `  ${chalk.cyan(
            "cmskit install button"
          )} - Install a button component`
        );
        logger.info(
          `  ${chalk.cyan("cmskit list")} - View all available components`
        );
      } catch (error) {
        logger.error("Initialization failed:", error);
        process.exit(1);
      }
    });

  return command;
}
