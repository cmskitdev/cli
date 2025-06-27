import chalk from "chalk";
import { Command } from "commander";
import { ComponentRegistry } from "../services/component-registry.js";
import { logger } from "../utils/logger.js";

/**
 * Creates the list command for viewing available components.
 *
 * @returns The configured list command.
 */
export function listCommand(): Command {
  const command = new Command("list")
    .alias("ls")
    .description("List all available components")
    .option("-c, --category <category>", "filter by category")
    .option("-s, --search <query>", "search components")
    .action(async (options) => {
      try {
        const registry = new ComponentRegistry();

        let components;
        if (options.search) {
          components = await registry.searchComponents(options.search);
        } else {
          components = await registry.getAvailableComponents();
        }

        // Filter by category if specified
        if (options.category) {
          components = components.filter(
            (c) => c.category.toLowerCase() === options.category.toLowerCase()
          );
        }

        if (components.length === 0) {
          logger.info("No components found.");
          return;
        }

        // Group by category
        const grouped = components.reduce((acc, component) => {
          if (!acc[component.category]) {
            acc[component.category] = [];
          }
          acc[component.category].push(component);
          return acc;
        }, {} as Record<string, typeof components>);

        // Display components
        console.log("\nAvailable components:\n");

        Object.entries(grouped).forEach(([category, items]) => {
          console.log(chalk.bold.cyan(category));
          items.forEach((component) => {
            console.log(
              `  ${chalk.green("•")} ${component.id} - ${chalk.gray(
                component.description
              )}`
            );
          });
          console.log();
        });

        logger.info(`Total: ${components.length} components`);
      } catch (error) {
        logger.error("Failed to list components:", error);
        process.exit(1);
      }
    });

  return command;
}
