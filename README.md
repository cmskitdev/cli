# @cmskit/cli

A powerful CLI for installing custom UI component packages built with TypeScript. This CLI provides a modern, type-safe way to manage and install UI components in your Svelte/SvelteKit projects.

## Features

- 🚀 **TypeScript-first**: Built entirely in TypeScript for type safety and better developer experience
- 🎯 **Smart Project Detection**: Automatically detects your project configuration (Svelte/SvelteKit, TypeScript, styling, package manager)
- 📦 **Component Registry**: Access to a curated registry of high-quality UI components
- 🔧 **Flexible Installation**: Install components individually or browse the entire catalog
- 🎨 **Styling Support**: Works with Tailwind CSS, CSS, SCSS, or plain styles
- 📝 **Dependency Management**: Automatically installs required npm packages
- 🔄 **Component Dependencies**: Resolves and installs component dependencies automatically

## Installation

```bash
npm install -g @cmskit/cli
```

Or use it directly with npx:

```bash
npx @cmskit/cli@latest
```

## Usage

### Initialize your project

Set up CMSKit in your existing Svelte/SvelteKit project:

```bash
cmskit init
```

This command will:
- Detect your project configuration
- Create a `cmskit.config.json` file
- Set up the necessary directory structure

### Install components

Install specific components:

```bash
cmskit install button card
```

Or browse and select components interactively:

```bash
cmskit install
```

#### Options

- `-p, --path <path>`: Custom installation path (default: `src/lib/components`)
- `-f, --force`: Overwrite existing components
- `--dry-run`: Preview changes without installing
- `--registry <url>`: Use a custom registry URL

### List available components

View all available components in the registry:

```bash
cmskit list
```

#### Options

- `-c, --category <category>`: Filter by category
- `-s, --search <query>`: Search for specific components

## Configuration

The CLI creates a `cmskit.config.json` file in your project root:

```json
{
  "version": "1.0.0",
  "styling": "tailwind",
  "paths": {
    "components": "src/lib/components"
  },
  "registry": {
    "url": "https://api.cmskit.dev"
  }
}
```

## Project Structure

The CLI installs components in a structured way:

```
src/lib/components/
├── button/
│   ├── button.svelte
│   ├── button.ts
│   └── index.ts
├── card/
│   ├── card.svelte
│   ├── card-header.svelte
│   ├── card-content.svelte
│   └── index.ts
└── ...
```

## API Reference

### `ComponentRegistry`

Service for interacting with the component registry:

```typescript
import { ComponentRegistry } from '@cmskit/cli';

const registry = new ComponentRegistry();
const components = await registry.getAvailableComponents();
```

### `ComponentInstaller`

Service for installing components:

```typescript
import { ComponentInstaller, ComponentRegistry, ProjectAnalyzer } from '@cmskit/cli';

const analyzer = new ProjectAnalyzer();
const projectInfo = await analyzer.analyze();
const registry = new ComponentRegistry();

const installer = new ComponentInstaller({
  projectInfo: { config: projectInfo.config },
  registry,
  force: false,
  dryRun: false
});

const results = await installer.installComponents(['button'], 'src/lib/components');
```

### `ProjectAnalyzer`

Analyzes project configuration:

```typescript
import { ProjectAnalyzer } from '@cmskit/cli';

const analyzer = new ProjectAnalyzer();
const projectInfo = await analyzer.analyze();

if (projectInfo.isValid) {
  console.log(projectInfo.config);
  // { framework: 'sveltekit', typescript: true, styling: 'tailwind', ... }
}
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, pnpm, or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/cmskit.git

# Navigate to the CLI package
cd packages/cli

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Scripts

- `npm run dev`: Run the CLI in watch mode
- `npm run build`: Build the CLI for production
- `npm run test`: Run tests
- `npm run typecheck`: Check TypeScript types

### Architecture

The CLI is built with:
- **Commander.js**: Command-line interface framework
- **Inquirer**: Interactive prompts
- **Zod**: Schema validation
- **Chalk**: Terminal styling
- **Ora**: Elegant terminal spinners
- **Execa**: Better child process execution

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT © CMSKit Contributors 