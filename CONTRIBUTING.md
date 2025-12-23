# Contributing to fair-playwright

Thank you for your interest in contributing to fair-playwright! This document provides guidelines and instructions for contributing.

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Assume good intentions

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Ways to Contribute

### Reporting Bugs

Before creating a bug report:

1. **Search existing issues** to avoid duplicates
2. **Check the troubleshooting guide**: [docs/guide/troubleshooting.md](https://baranaytass.github.io/fair-playwright/guide/troubleshooting)
3. **Verify with latest version**: `npm install -D fair-playwright@latest`

**Bug Report Template:**

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., macOS 14.0]
- Node.js: [e.g., v20.10.0]
- Playwright: [e.g., 1.40.0]
- fair-playwright: [e.g., 1.1.0]

## Configuration
```typescript
// Your playwright.config.ts
```

## Screenshots/Logs
If applicable, add screenshots or logs
```

### Suggesting Features

Before suggesting a feature:

1. **Check existing feature requests**
2. **Consider if it fits the project scope**
3. **Think about implementation complexity**

**Feature Request Template:**

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed? What problem does it solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Any other relevant information
```

### Improving Documentation

Documentation improvements are always welcome!

**Areas to contribute:**
- Fix typos or unclear explanations
- Add examples
- Improve API documentation
- Translate documentation

**Documentation structure:**
```
docs/
├── guide/          # User guides
├── api/            # API reference
├── examples/       # Code examples
└── .vitepress/     # VitePress config
```

### Contributing Code

## Development Setup

### Prerequisites

- Node.js >= 18
- npm or pnpm
- Git

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/fair-playwright.git
cd fair-playwright

# Add upstream remote
git remote add upstream https://github.com/baranaytass/fair-playwright.git
```

### Install Dependencies

```bash
npm install
```

### Project Structure

```
fair-playwright/
├── src/
│   ├── reporter/         # Main reporter
│   ├── formatters/       # Output formatters
│   ├── mcp/              # MCP server
│   └── types/            # TypeScript types
├── docs/                 # VitePress documentation
├── test-project/         # Integration tests (local only)
├── package.json
└── tsup.config.ts        # Build configuration
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Changes

```bash
# Run in watch mode during development
npm run dev

# Or build once
npm run build
```

### 3. Test Changes

```bash
# Run unit tests
npm test

# Run in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Type checking
npm run typecheck

# Linting
npm run lint
```

### 4. Format Code

```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

### 5. Test Locally

```bash
# Build and test in test-project
npm run build
cd test-project
npm install
npm test
```

## Code Guidelines

### TypeScript

- **Use strict mode**: All code must pass `tsc --strict`
- **No `any` types**: Use proper types or `unknown`
- **Export types**: Export all public types from `src/types/index.ts`

**Example:**

```typescript
// ✅ Good
interface Config {
  mode: 'progressive' | 'full' | 'minimal';
  verbose: boolean;
}

function configure(config: Config): void {
  // Implementation
}

// ❌ Avoid
function configure(config: any): void {
  // Implementation
}
```

### Naming Conventions

- **Files**: `PascalCase.ts` for classes, `camelCase.ts` for utilities
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: `PascalCase`

**Example:**

```typescript
// File: src/reporter/FairReporter.ts
export class FairReporter implements Reporter {
  private readonly DEFAULT_CONFIG: ReporterConfig = { ... };

  onTestBegin(test: TestCase, result: TestResult): void {
    // Implementation
  }
}
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Trailing commas**: Yes
- **Max line length**: 100 characters

**Example:**

```typescript
// ✅ Good
const options: StepOptions = {
  title: 'My step',
  success: 'Step completed',
  failure: 'Step failed',
};

// ❌ Avoid
const options: StepOptions = {
  title: "My step",
  success: "Step completed",
  failure: "Step failed"
}
```

### Testing

- **Test all new features**: Write tests for new functionality
- **Test edge cases**: Cover error cases and edge conditions
- **Keep tests focused**: One test per scenario
- **Use descriptive names**: Test names should describe what they test

**Example:**

```typescript
import { describe, it, expect } from 'vitest';

describe('E2E Helper', () => {
  it('should execute MAJOR step with MINOR sub-steps', async () => {
    // Test implementation
  });

  it('should handle step failures correctly', async () => {
    // Test implementation
  });

  it('should throw error when steps array is empty', async () => {
    // Test implementation
  });
});
```

### Documentation

- **JSDoc comments**: Add JSDoc for all public APIs
- **Examples**: Include usage examples in comments
- **Type annotations**: Always include parameter and return types

**Example:**

```typescript
/**
 * Execute a MAJOR test step with hierarchical sub-steps.
 *
 * @param title - Step title displayed in output
 * @param options - Step configuration with success/failure messages and sub-steps
 * @returns Promise that resolves when all steps complete
 *
 * @example
 * ```typescript
 * await e2e.major('User login flow', {
 *   success: 'User logged in',
 *   failure: 'Login failed',
 *   steps: [
 *     {
 *       title: 'Open login page',
 *       success: 'Page loaded',
 *       action: async () => {
 *         await page.goto('/login');
 *       }
 *     }
 *   ]
 * });
 * ```
 */
export async function major(
  title: string,
  options: MajorStepOptions
): Promise<void> {
  // Implementation
}
```

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test improvements
- `chore`: Build process or tooling changes
- `perf`: Performance improvements

**Examples:**

```bash
# Feature
git commit -m "feat(e2e): add support for conditional steps"

# Bug fix
git commit -m "fix(reporter): correct step duration calculation"

# Documentation
git commit -m "docs(guide): improve MCP setup instructions"

# With body
git commit -m "refactor(formatter): simplify output rendering

Extract terminal update logic into separate method for better
testability and maintainability."
```

## Pull Request Process

### 1. Update Your Branch

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main
```

### 2. Push Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

Go to GitHub and create a pull request from your branch to `main`.

**PR Title:** Follow commit message format

**PR Description Template:**

```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Testing
How has this been tested?

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
```

### 4. Code Review

- **Be responsive**: Respond to review comments promptly
- **Be open to feedback**: Reviews improve code quality
- **Make requested changes**: Update PR based on feedback
- **Ask questions**: If something is unclear, ask!

### 5. Merge

Once approved, a maintainer will merge your PR. Thank you for contributing!

## Release Process

Releases are automated using [Changesets](https://github.com/changesets/changesets).

### For Contributors

If your PR includes user-facing changes, add a changeset:

```bash
npx changeset
```

Select the type of change:
- `patch`: Bug fixes
- `minor`: New features (backward compatible)
- `major`: Breaking changes

Write a brief description of the change.

### For Maintainers

```bash
# Create release PR
npx changeset version

# Publish to npm (CI handles this)
npx changeset publish
```

## Getting Help

- **Documentation**: https://baranaytass.github.io/fair-playwright/
- **Issues**: https://github.com/baranaytass/fair-playwright/issues
- **Discussions**: https://github.com/baranaytass/fair-playwright/discussions

## Recognition

Contributors are recognized in:
- Release notes
- CHANGELOG.md
- GitHub contributors page

Thank you for contributing to fair-playwright! 🎉
