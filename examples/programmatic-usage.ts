#!/usr/bin/env tsx

/**
 * Example of using @cmskit/cli programmatically.
 * This demonstrates how to use the CLI's APIs directly in your own scripts.
 */

import {
  ComponentInstaller,
  ComponentRegistry,
  ProjectAnalyzer,
} from "../src/index.js";
import { logger } from "../src/utils/logger.js";

async function main() {
  try {
    // Step 1: Analyze the current project
    logger.info("Analyzing project...");
    const analyzer = new ProjectAnalyzer();
    const projectInfo = await analyzer.analyze();

    if (!projectInfo.isValid || !projectInfo.config) {
      logger.error("Not a valid Svelte project!");
      process.exit(1);
    }

    logger.success(
      `Detected: ${projectInfo.config.framework} project with ${projectInfo.config.styling} styling`
    );

    // Step 2: Connect to the component registry
    const registry = new ComponentRegistry();

    // Step 3: List available components
    logger.info("\nFetching available components...");
    const components = await registry.getAvailableComponents();
    logger.success(`Found ${components.length} components`);

    // Display first 5 components
    components.slice(0, 5).forEach((component) => {
      logger.info(`  • ${component.id}: ${component.description}`);
    });

    // Step 4: Search for specific components
    logger.info("\nSearching for button components...");
    const buttonComponents = await registry.searchComponents("button");
    logger.success(
      `Found ${buttonComponents.length} button-related components`
    );

    // Step 5: Install a component (dry run)
    logger.info('\nSimulating installation of "button" component (dry run)...');

    const installer = new ComponentInstaller({
      projectInfo: { config: projectInfo.config },
      registry,
      force: false,
      dryRun: true, // Set to false to actually install
    });

    const results = await installer.installComponents(
      ["button"],
      projectInfo.config.paths.components
    );

    // Display results
    results.forEach((result) => {
      if (result.success) {
        logger.success(`✓ ${result.component} would be installed`);
        if (result.files) {
          result.files.forEach((file) => {
            logger.info(`    → ${file}`);
          });
        }
        if (result.dependencies?.length) {
          logger.info(`    Dependencies: ${result.dependencies.join(", ")}`);
        }
      } else {
        logger.error(`✗ ${result.component}: ${result.error}`);
      }
    });

    logger.info("\n💡 To actually install components, set dryRun to false");
  } catch (error) {
    logger.error("An error occurred:", error);
    process.exit(1);
  }
}

// Run the example
main();
