# Contributing to EcoWarrior

Thank you for considering a contribution to EcoWarrior! This guide will help you get started.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Message Format](#commit-message-format)

---

## Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-fork/ecowarrior.git
cd ecowarrior/project

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env

# 4. Start the dev server
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Code Standards

### TypeScript

- **Strict mode** is enabled — no implicit `any`, no unused locals/params
- Use explicit return types on exported functions
- Prefer `interface` over `type` for component props
- Use `as const` for immutable data objects

### React

- Functional components only (no class components)
- Use `useMemo` for expensive derived values
- Use `React.lazy` + `Suspense` for new route-level components
- Keep components focused — extract complex logic into `src/lib/` utilities

### Accessibility

Every interactive element must have:
- A meaningful `aria-label` or associated `<label>` element
- A visible focus indicator (use Tailwind's `focus-visible:ring-2`)
- Keyboard operability

### ESLint

```bash
npm run lint
```

All lint warnings must be resolved before opening a PR.

### File Naming

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `EcoScoreCard.tsx` |
| Utilities | camelCase | `ecoScore.ts` |
| Tests | `*.test.ts(x)` | `calculations.test.ts` |

---

## Testing

All new features must include tests:

```bash
# Run tests
npm run test

# Run with coverage (must stay ≥ 80%)
npm run test:coverage
```

- Place test files in `src/test/`
- Mock heavy dependencies (e.g., recharts, stores) in individual test files
- Use `@testing-library/user-event` for user interactions
- Prefer queries that reflect accessibility (`getByRole`, `getByLabelText`) over `getByTestId`

---

## Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and ensure:
   - `npm run typecheck` passes
   - `npm run lint` passes
   - `npm run test:coverage` passes with ≥ 80% coverage
   - `npm run build` succeeds with no errors

3. Open a Pull Request against `main` with:
   - A clear description of what changed and why
   - Screenshots/recordings for UI changes
   - Reference to any relevant issues (`Closes #123`)

4. A maintainer will review and merge once approved.

---

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting (no logic change) |
| `refactor` | Code restructure (no behaviour change) |
| `test` | Adding or fixing tests |
| `chore` | Dependency updates, config changes |

**Examples:**

```
feat(dashboard): add Eco Score card with weekly progress bar
fix(auth): prevent empty username on sign-up
test(calculations): add edge cases for validateActivityInput
docs(readme): update quick start instructions
```

---

## Questions?

Open an issue or start a discussion on GitHub. We're happy to help!
