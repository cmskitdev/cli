import { confirm, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { ComponentInstaller } from "../services/component-installer.js";
import { ComponentRegistry } from "../services/component-registry.js";
import { ProjectAnalyzer } from "../services/project-analyzer.js";
import { logger } from "../utils/logger.js";
import { formatPath } from "../utils/paths.js";

/**
 * Creates the install command for the CLI.
 *
 * @returns The configured install command.
 */
export function installCommand(): Command {
  const command = new Command("install")
    .alias("i")
    .description("Install UI components from the registry")
    .argument("[components...]", "components to install")
    .option("-p, --path <path>", "installation path", "src/lib/components")
    .option("-f, --force", "overwrite existing components")
    .option("--dry-run", "preview changes without installing")
    .option("--registry <url>", "custom registry URL")
    .action(async (components: string[], options) => {
      const spinner = ora();

      try {
        // Analyze project
        spinner.start("Analyzing project...");
        const analyzer = new ProjectAnalyzer();
        const projectInfo = await analyzer.analyze();
        spinner.succeed("Project analysis complete");

        if (!projectInfo.isValid || !projectInfo.config) {
          logger.error("This doesn't appear to be a valid Svelte project.");
          logger.info('Run "cmskit init" to set up your project first.');
          process.exit(1);
        }

        // Get registry
        const registry = new ComponentRegistry(options.registry);

        // If no components specified, show interactive selection
        if (!components.length) {
          spinner.start("Fetching available components...");
          const availableComponents = await registry.getAvailableComponents();
          spinner.stop();

          const selected = await select({
            message: "Which components would you like to install?",
            choices: availableComponents.map((c) => ({
              name: c.name,
              value: c.id,
              description: c.description,
            })),
          });

          components = [selected];
        }

        // Validate installation path
        const installPath = formatPath(options.path);

        // Confirm installation
        logger.info(
          `\nComponents to install: ${chalk.cyan(components.join(", "))}`
        );
        logger.info(`Installation path: ${chalk.cyan(installPath)}`);

        if (!options.dryRun) {
          const shouldContinue = await confirm({
            message: "Proceed with installation?",
            default: true,
          });

          if (!shouldContinue) {
            logger.info("Installation cancelled.");
            return;
          }
        }

        // Install components
        const installer = new ComponentInstaller({
          projectInfo: { config: projectInfo.config },
          registry,
          force: options.force,
          dryRun: options.dryRun,
        });

        spinner.start("Installing components...");
        const results = await installer.installComponents(
          components,
          installPath
        );
        spinner.stop();

        // Display results
        results.forEach((result) => {
          if (result.success) {
            logger.success(`✓ ${result.component} installed successfully`);
            if (result.files) {
              result.files.forEach((file) => {
                logger.info(`  ${chalk.gray("•")} ${file}`);
              });
            }
          } else {
            logger.error(`✗ ${result.component} failed: ${result.error}`);
          }
        });

        // Install dependencies if needed
        if (!options.dryRun && results.some((r) => r.dependencies?.length)) {
          spinner.start("Installing dependencies...");
          await installer.installDependencies();
          spinner.succeed("Dependencies installed");
        }

        logger.success("\nInstallation complete! 🎉");
      } catch (error) {
        spinner.fail("Installation failed");
        logger.error(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  return command;
}
