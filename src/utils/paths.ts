import { join, relative, resolve } from "path";

/**
 * Formats a path relative to the current working directory.
 *
 * @param path - The path to format.
 * @returns The formatted path.
 */
export function formatPath(path: string): string {
  return relative(process.cwd(), resolve(path)) || ".";
}

/**
 * Joins path segments and normalizes the result.
 *
 * @param segments - Path segments to join.
 * @returns The joined path.
 */
export function joinPath(...segments: string[]): string {
  return join(...segments);
}
