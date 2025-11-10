# Contributing to Meme Coin Aggregator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/meme-coin-aggregator.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m "Add feature X"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start Redis (Docker)
docker run -d -p 6379:6379 redis:alpine

# Run in development mode
npm run dev

# Run tests
npm test
```

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage
- Test both happy paths and edge cases

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update tests to reflect changes
3. Ensure all tests pass
4. Update documentation as needed
5. Request review from maintainers

## Pull Request Guidelines

### Title Format
```
[Type] Brief description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- refactor: Code refactoring
- test: Test changes
- chore: Build/tooling changes
```

### Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass locally
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Reporting Bugs

### Bug Report Template
```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
 - OS: [e.g. Windows 11]
 - Node version: [e.g. 18.17.0]
 - Browser: [e.g. Chrome 119]

**Additional context**
Any other relevant information
```

## Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Any other context or screenshots
```

## Code Review Process

1. At least one maintainer must approve
2. All automated checks must pass
3. No merge conflicts
4. Changes must align with project goals

## Questions?

Feel free to:
- Open an issue for questions
- Reach out to maintainers
- Join discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
