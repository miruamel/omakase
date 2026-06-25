# Contributing to Omakase

Thank you for your interest in contributing! Here's how to get started.

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/omakase.git`
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make changes and test: `bun test`
6. Commit and push: `git push origin feature/your-feature`
7. Open a Pull Request

## Development Setup

### Requirements

- Bun >= 1.0
- Node.js >= 18 (optional)

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/core/resilience/provider-health.test.ts

# Run with coverage
bun test --coverage
```

### Type Checking

```bash
bun run typecheck
```

### Building

```bash
bun run build
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Write tests for new features

## Commit Messages

We use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation change
- `test:` Test update
- `refactor:` Code refactor
- `chore:` Maintenance task

Example: `feat: Add provider health monitoring`

## Pull Request Process

1. Update CHANGELOG.md for user-facing changes
2. Update documentation if needed
3. Ensure all tests pass
4. Request review from maintainers

## Questions?

Open an issue for any questions or discussions.
