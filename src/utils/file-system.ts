import fg from "fast-glob";
import { existsSync, promises as fs } from "fs";
import { dirname, join, resolve } from "path";

/**
 * Finds a file by walking up the directory tree.
 *
 * @param names - File names to search for.
 * @param cwd - Current working directory.
 * @returns The path to the found file or null.
 */
export async function findUp(
  names: string[],
  cwd: string = process.cwd()
): Promise<string | null> {
  let dir = resolve(cwd);
  const root = resolve("/");

  while (dir !== root) {
    for (const name of names) {
      const filePath = join(dir, name);
      if (existsSync(filePath)) {
        return filePath;
      }
    }
    dir = dirname(dir);
  }

  return null;
}

/**
 * Ensures a directory exists, creating it if necessary.
 *
 * @param path - The directory path.
 */
export async function ensureDir(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

/**
 * Writes a file, creating parent directories if necessary.
 *
 * @param path - The file path.
 * @param content - The file content.
 */
export async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path));
  await fs.writeFile(path, content, "utf-8");
}

/**
 * Finds files matching glob patterns.
 *
 * @param patterns - Glob patterns to match.
 * @param options - Glob options.
 * @returns Array of matched file paths.
 */
export async function findFiles(
  patterns: string | string[],
  options?: fg.Options
): Promise<string[]> {
  return fg(patterns, {
    onlyFiles: true,
    ...options,
  });
}
