import { z } from "zod";

/**
 * Schema for component metadata.
 */
const ComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  dependencies: z.array(z.string()),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
      type: z.enum(["component", "style", "util", "type"]),
    })
  ),
});

export type Component = z.infer<typeof ComponentSchema>;

/**
 * Service for interacting with the component registry.
 */
export class ComponentRegistry {
  private baseUrl: string;
  private cache: Map<string, Component> = new Map();

  constructor(
    baseUrl: string = process.env.CMSKIT_REGISTRY_URL ||
      "https://api.cmskit.dev"
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Fetches all available components from the registry.
   *
   * @returns Array of available components.
   */
  async getAvailableComponents(): Promise<Component[]> {
    const response = await fetch(`${this.baseUrl}/registry/components`);

    if (!response.ok) {
      throw new Error(`Failed to fetch components: ${response.statusText}`);
    }

    const data = await response.json();
    return z.array(ComponentSchema).parse(data);
  }

  /**
   * Fetches a specific component by ID.
   *
   * @param componentId - The component ID.
   * @returns The component data.
   */
  async getComponent(componentId: string): Promise<Component> {
    // Check cache first
    if (this.cache.has(componentId)) {
      return this.cache.get(componentId)!;
    }

    const response = await fetch(
      `${this.baseUrl}/registry/components/${componentId}`
    );

    if (!response.ok) {
      throw new Error(`Component "${componentId}" not found`);
    }

    const data = await response.json();
    const component = ComponentSchema.parse(data);

    // Cache the result
    this.cache.set(componentId, component);

    return component;
  }

  /**
   * Fetches multiple components by IDs.
   *
   * @param componentIds - Array of component IDs.
   * @returns Array of components.
   */
  async getComponents(componentIds: string[]): Promise<Component[]> {
    return Promise.all(componentIds.map((id) => this.getComponent(id)));
  }

  /**
   * Searches for components by query.
   *
   * @param query - Search query.
   * @returns Array of matching components.
   */
  async searchComponents(query: string): Promise<Component[]> {
    const response = await fetch(
      `${this.baseUrl}/registry/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return z.array(ComponentSchema).parse(data);
  }
}
