import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { z } from "zod";
import { findUp } from "../utils/file-system.js";

/**
 * Schema for project configuration.
 */
const ProjectConfigSchema = z.object({
  framework: z.enum(["svelte", "sveltekit"]),
  typescript: z.boolean(),
  styling: z.enum(["tailwind", "css", "scss", "none"]),
  packageManager: z.enum(["npm", "yarn", "pnpm", "bun"]),
  paths: z.object({
    components: z.string(),
    lib: z.string(),
    src: z.string(),
  }),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

/**
 * Analyzes the current project to determine its configuration and structure.
 */
export class ProjectAnalyzer {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = resolve(cwd);
  }

  /**
   * Analyzes the project and returns its configuration.
   *
   * @returns The project configuration.
   */
  async analyze(): Promise<{
    isValid: boolean;
    config?: ProjectConfig;
    error?: string;
  }> {
    try {
      // Check if this is a Svelte project
      const svelteConfig = await this.findSvelteConfig();
      if (!svelteConfig) {
        return { isValid: false, error: "No svelte.config.js found" };
      }

      // Detect framework
      const framework = await this.detectFramework();

      // Detect TypeScript
      const typescript = await this.hasTypeScript();

      // Detect styling
      const styling = await this.detectStyling();

      // Detect package manager
      const packageManager = await this.detectPackageManager();

      // Determine paths
      const paths = await this.determinePaths();

      const config: ProjectConfig = {
        framework,
        typescript,
        styling,
        packageManager,
        paths,
      };

      return { isValid: true, config };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Finds the Svelte configuration file.
   *
   * @returns The path to the config file or null.
   */
  private async findSvelteConfig(): Promise<string | null> {
    return findUp(["svelte.config.js", "svelte.config.ts"], this.cwd);
  }

  /**
   * Detects whether the project uses SvelteKit or plain Svelte.
   *
   * @returns The detected framework.
   */
  private async detectFramework(): Promise<"svelte" | "sveltekit"> {
    // Check for SvelteKit-specific files
    const hasAppHtml = existsSync(join(this.cwd, "src/app.html"));
    const hasRoutes = existsSync(join(this.cwd, "src/routes"));

    return hasAppHtml || hasRoutes ? "sveltekit" : "svelte";
  }

  /**
   * Checks if the project uses TypeScript.
   *
   * @returns True if TypeScript is used.
   */
  private async hasTypeScript(): Promise<boolean> {
    const tsconfigPath = await findUp(
      ["tsconfig.json", "tsconfig.node.json"],
      this.cwd
    );
    return tsconfigPath !== null;
  }

  /**
   * Detects the styling solution used in the project.
   *
   * @returns The detected styling solution.
   */
  private async detectStyling(): Promise<"tailwind" | "css" | "scss" | "none"> {
    // Check for Tailwind
    const tailwindConfig = await findUp(
      ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.cjs"],
      this.cwd
    );
    if (tailwindConfig) return "tailwind";

    // Check package.json for SCSS
    const packageJsonPath = join(this.cwd, "package.json");
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (packageJson.devDependencies?.sass || packageJson.dependencies?.sass) {
        return "scss";
      }
    }

    // Check for CSS files
    const hasCss =
      existsSync(join(this.cwd, "src/app.css")) ||
      existsSync(join(this.cwd, "src/global.css"));

    return hasCss ? "css" : "none";
  }

  /**
   * Detects the package manager used in the project.
   *
   * @returns The detected package manager.
   */
  private async detectPackageManager(): Promise<
    "npm" | "yarn" | "pnpm" | "bun"
  > {
    if (existsSync(join(this.cwd, "bun.lockb"))) return "bun";
    if (existsSync(join(this.cwd, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(join(this.cwd, "yarn.lock"))) return "yarn";
    return "npm";
  }

  /**
   * Determines the project paths.
   *
   * @returns The project paths.
   */
  private async determinePaths(): Promise<ProjectConfig["paths"]> {
    const srcPath = existsSync(join(this.cwd, "src")) ? "src" : ".";
    const libPath = existsSync(join(this.cwd, srcPath, "lib"))
      ? join(srcPath, "lib")
      : srcPath;
    const componentsPath = join(libPath, "components");

    return {
      src: srcPath,
      lib: libPath,
      components: componentsPath,
    };
  }
}
