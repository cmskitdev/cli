import chalk from "chalk";

/**
 * Logger utility for consistent console output formatting.
 */
export const logger = {
  /**
   * Logs an informational message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  info: (message: string, ...args: any[]) => {
    console.log(chalk.blue("ℹ"), message, ...args);
  },

  /**
   * Logs a success message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  success: (message: string, ...args: any[]) => {
    console.log(chalk.green("✓"), message, ...args);
  },

  /**
   * Logs a warning message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  warn: (message: string, ...args: any[]) => {
    console.log(chalk.yellow("⚠"), message, ...args);
  },

  /**
   * Logs an error message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  error: (message: string | Error, ...args: any[]) => {
    if (message instanceof Error) {
      console.error(chalk.red("✗"), message.message, ...args);
      if (process.env.DEBUG) {
        console.error(message.stack);
      }
    } else {
      console.error(chalk.red("✗"), message, ...args);
    }
  },

  /**
   * Logs a debug message (only in debug mode).
   *
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray("[DEBUG]"), message, ...args);
    }
  },
};
