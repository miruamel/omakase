# Contributing to Omakase

Thank you for your interest in contributing! This guide will help you get started.

## Quick Start

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/omakase.git
cd omakase
bun install
```

### 2. Make Changes

Create a branch:
```bash
git checkout -b feature/your-feature
```

Make your changes following the project style.

### 3. Test

```bash
# Run all tests
bun test

# Type check
bun run typecheck

# Validate resilience features
./scripts/validate-resilience.sh
```

### 4. Commit

```bash
git add .
git commit -m "feat: Add your awesome feature"
git push origin feature/your-feature
```

### 5. Open PR

Go to https://github.com/miruamel/omakase/pulls and create a new PR.

## Development Setup

### Requirements

- **Bun** >= 1.0 (https://bun.sh)
- **Node.js** >= 18 (optional, for reference)

### Install Dependencies

```bash
bun install
```

### Run Development Mode

```bash
bun run dev
```

### Build

```bash
bun run build
```

## Project Structure

```
src/
├── entrypoints/      # CLI entry point
├── core/
│   ├── engine/       # QueryEngine
│   ├── providers/    # LLM providers
│   ├── resilience/   # Circuit breaker, health manager
│   ├── agents/       # Multi-agent system
│   ├── tools/        # Built-in tools
│   ├── chronos/      # Scheduler
│   └── ui/           # Terminal components
├── tests/            # Test files
└── types/            # TypeScript types
```

## Coding Standards

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use arrow functions for callbacks
- Add JSDoc comments for public APIs

```typescript
/**
 * Calculate factorial.
 * @param n - Number to calculate
 * @returns Factorial of n
 */
function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}
```

### Formatting

We use Prettier (when available):
```bash
./scripts/format.sh
```

### Naming Conventions

- **Files**: kebab-case (`provider-health.ts`)
- **Classes**: PascalCase (`ProviderHealthManager`)
- **Functions**: camelCase (`sendMessage`)
- **Constants**: UPPER_SNAKE_CASE (`CIRCUIT_BREAKER`)
- **Types**: PascalCase (`Message`, `ToolCall`)

## Testing

### Write Tests

Add tests in `*.test.ts` files next to the source:

```typescript
// src/core/utils.test.ts
import { expect, test } from 'bun:test'
import { add } from './utils'

test('add should sum two numbers', () => {
  expect(add(2, 3)).toBe(5)
})
```

### Run Tests

```bash
# All tests
bun test

# Specific test file
bun test src/core/utils.test.ts

# With coverage
bun test --coverage
```

### Test Guidelines

- Test edge cases
- Test error conditions
- Aim for 80%+ coverage
- Use descriptive test names

## Documentation

### Update Documentation

When adding features:
1. Update `README.md`
2. Add to relevant guide in `docs/`
3. Update `CHANGELOG.md`
4. Add JSDoc comments

### Documentation Standards

- Use clear, concise language
- Include code examples
- Explain "why", not just "what"
- Keep docs in sync with code

## Pull Request Process

### PR Template

All PRs should:
- Have a clear title and description
- Reference related issues (e.g., "Fixes #123")
- Include tests where applicable
- Update documentation
- Pass CI checks

### Review Process

1. Maintainer reviews code
2. Automated checks run (CI)
3. Feedback provided (if any)
4. Changes merged

### Commit Messages

We use conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Code refactor
chore: Maintenance task
```

Examples:
- `feat: Add provider health monitoring`
- `fix: Handle null pointer in Agent`
- `docs: Update README with new features`

## Areas We Need Help

### High Priority
- [ ] E2E tests
- [ ] IDE integration (VS Code extension)
- [ ] Plugin marketplace
- [ ] Performance optimizations

### Medium Priority
- [ ] Additional LLM providers
- [ ] More built-in tools
- [ ] Multi-language support
- [ ] Web UI

### Any Priority
- [ ] Bug fixes
- [ ] Documentation improvements
- [ ] Test coverage
- [ ] Code cleanup

## Reporting Issues

### Bug Reports

Include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Environment (OS, Bun version, Omakase version)
4. Logs or screenshots

### Feature Requests

Include:
1. Problem you're trying to solve
2. Proposed solution
3. Alternatives considered
4. Use cases

## Community Guidelines

### Code of Conduct

- Be respectful
- Be inclusive
- Accept constructive criticism
- Focus on what's best for the community

Full code of conduct in [.github/CODE_OF_CONDUCT_LINK.md](CODE_OF_CONDUCT_LINK.md)

### Getting Help

- Check existing issues and documentation first
- Ask in [GitHub Discussions](https://github.com/miruamel/omakase/discussions)
- Contact maintainers

## Recognition

We recognize contributors via:
- GitHub contributor graph
- Thanks in release notes
- Special mentions for major contributions

## License

By contributing, you agree that your contributions will be licensed under the same license as Omakase (Apache 2.0 OR MIT).

---

**Questions?** Open an issue or ask in discussions!

**Ready to start?** Pick an issue labeled "good first issue"!
