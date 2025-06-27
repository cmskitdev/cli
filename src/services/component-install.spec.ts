import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentInstaller } from "./component-installer.js";
import { ComponentRegistry } from "./component-registry.js";
import { ProjectConfig } from "./project-analyzer.js";

describe("ComponentInstaller", () => {
  let installer: ComponentInstaller;
  let mockRegistry: ComponentRegistry;
  let mockProjectConfig: ProjectConfig;

  beforeEach(() => {
    mockProjectConfig = {
      framework: "sveltekit",
      typescript: true,
      styling: "tailwind",
      packageManager: "npm",
      paths: {
        src: "src",
        lib: "src/lib",
        components: "src/lib/components",
      },
    };

    mockRegistry = {
      getComponent: vi.fn(),
      getComponents: vi.fn(),
      getAvailableComponents: vi.fn(),
      searchComponents: vi.fn(),
    } as any;

    installer = new ComponentInstaller({
      projectInfo: { config: mockProjectConfig },
      registry: mockRegistry,
      force: false,
      dryRun: true,
    });
  });

  it("should install a component successfully", async () => {
    const mockComponent = {
      id: "button",
      name: "Button",
      description: "A button component",
      category: "form",
      dependencies: ["clsx"],
      files: [
        {
          path: "button.svelte",
          content: "<button>Click me</button>",
          type: "component" as const,
        },
      ],
    };

    vi.mocked(mockRegistry.getComponent).mockResolvedValue(mockComponent);

    const results = await installer.installComponents(
      ["button"],
      "src/lib/components"
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      component: "Button",
      success: true,
      dependencies: ["clsx"],
    });
  });
});
