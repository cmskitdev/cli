import { execa } from "execa";
import { existsSync } from "fs";
import { join } from "path";
import { writeFile } from "../utils/file-system.js";
import { logger } from "../utils/logger.js";
import { Component, ComponentRegistry } from "./component-registry.js";
import { ProjectConfig } from "./project-analyzer.js";

/**
 * Options for the component installer.
 */
interface InstallerOptions {
  projectInfo: { config: ProjectConfig };
  registry: ComponentRegistry;
  force?: boolean;
  dryRun?: boolean;
}

/**
 * Result of a component installation.
 */
interface InstallResult {
  component: string;
  success: boolean;
  files?: string[];
  dependencies?: string[];
  error?: string;
}

/**
 * Service for installing components into a project.
 */
export class ComponentInstaller {
  private options: InstallerOptions;
  private installedDeps: Set<string> = new Set();

  constructor(options: InstallerOptions) {
    this.options = options;
  }

  /**
   * Installs multiple components.
   *
   * @param componentIds - IDs of components to install.
   * @param targetPath - Target installation path.
   * @returns Array of installation results.
   */
  async installComponents(
    componentIds: string[],
    targetPath: string
  ): Promise<InstallResult[]> {
    const results: InstallResult[] = [];

    // Resolve all components and their dependencies
    const allComponents = await this.resolveComponentsWithDependencies(
      componentIds
    );

    for (const component of allComponents) {
      try {
        const result = await this.installComponent(component, targetPath);
        results.push(result);
      } catch (error) {
        results.push({
          component: component.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Installs a single component.
   *
   * @param component - The component to install.
   * @param targetPath - Target installation path.
   * @returns Installation result.
   */
  private async installComponent(
    component: Component,
    targetPath: string
  ): Promise<InstallResult> {
    const installedFiles: string[] = [];

    // Install component files
    for (const file of component.files) {
      const filePath = join(targetPath, component.id, file.path);

      // Check if file exists and we're not forcing
      if (existsSync(filePath) && !this.options.force) {
        throw new Error(`File already exists: ${filePath}`);
      }

      if (!this.options.dryRun) {
        await writeFile(filePath, this.processFileContent(file.content));
      }

      installedFiles.push(filePath);
    }

    // Track dependencies
    const allDeps = [
      ...(component.dependencies || []),
      ...(component.devDependencies || []),
    ];

    allDeps.forEach((dep) => this.installedDeps.add(dep));

    return {
      component: component.name,
      success: true,
      files: installedFiles,
      dependencies: allDeps,
    };
  }

  /**
   * Processes file content, replacing variables and adjusting imports.
   *
   * @param content - The raw file content.
   * @returns Processed content.
   */
  private processFileContent(content: string): string {
    const { config } = this.options.projectInfo;

    // Replace path variables
    content = content.replace(/\$lib\//g, `$lib/`);
    content = content.replace(/\$components\//g, `$lib/components/`);

    // Adjust import extensions based on TypeScript usage
    if (!config.typescript) {
      content = content.replace(/\.ts'/g, `.js'`);
      content = content.replace(/\.ts"/g, `.js"`);
    }

    return content;
  }

  /**
   * Resolves all components including their dependencies.
   *
   * @param componentIds - Initial component IDs.
   * @returns All components including dependencies.
   */
  private async resolveComponentsWithDependencies(
    componentIds: string[]
  ): Promise<Component[]> {
    const resolved = new Map<string, Component>();
    const toResolve = [...componentIds];

    while (toResolve.length > 0) {
      const id = toResolve.shift()!;

      if (resolved.has(id)) continue;

      const component = await this.options.registry.getComponent(id);
      resolved.set(id, component);

      // Add registry dependencies to resolve
      if (component.registryDependencies) {
        component.registryDependencies.forEach((dep) => {
          if (!resolved.has(dep)) {
            toResolve.push(dep);
          }
        });
      }
    }

    return Array.from(resolved.values());
  }

  /**
   * Installs npm dependencies.
   */
  async installDependencies(): Promise<void> {
    if (this.installedDeps.size === 0) return;

    const { packageManager } = this.options.projectInfo.config;
    const deps = Array.from(this.installedDeps);

    logger.debug(
      `Installing dependencies with ${packageManager}: ${deps.join(", ")}`
    );

    const installCmd = {
      npm: ["install", ...deps],
      yarn: ["add", ...deps],
      pnpm: ["add", ...deps],
      bun: ["add", ...deps],
    }[packageManager];

    await execa(packageManager, installCmd, {
      cwd: process.cwd(),
      stdio: "inherit",
    });
  }
}
