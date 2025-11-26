# Contributing to Kodepos API Indonesia

Thank you for your interest in contributing to the Kodepos API Indonesia! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

- Use the [GitHub Issues](https://github.com/mxwllalpha/kodepos-api/issues) page to report bugs
- Provide detailed information about the bug including:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Environment details (Node.js version, OS, etc.)
- Include relevant screenshots or error messages

### Suggesting Features

- Use the [GitHub Issues](https://github.com/mxwllalpha/kodepos-api/issues) page to suggest features
- Clearly describe the feature and its benefits
- Provide use cases and examples if possible

### Submitting Changes

#### Fork and Clone

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kodepos-api.git
   cd kodepos-api
   ```

#### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up development environment:
   ```bash
   # Create a copy of the example environment file
   cp .env.example .env

   # Edit .env with your local configuration
   ```

3. Run tests to ensure everything works:
   ```bash
   npm test
   ```

#### Making Changes

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # Use conventional commit messages:
   # feat: new feature
   # fix: bug fix
   # docs: documentation changes
   # style: formatting changes
   # refactor: code refactoring
   # test: adding or updating tests
   # chore: build process or auxiliary tool changes
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request

## 📝 Coding Standards

### TypeScript

- Use TypeScript strict mode
- Provide proper type definitions
- Use interfaces over types where appropriate
- Prefer `const` over `let` when possible
- Use arrow functions for callbacks

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public functions
- Use ESLint and Prettier configurations

### Error Handling

- Use proper error handling with try-catch blocks
- Provide meaningful error messages
- Use custom error types when appropriate
- Log errors for debugging

### Testing

- Write unit tests for new functionality
- Aim for high test coverage
- Test both success and error cases
- Use descriptive test names

## 🏗️ Project Structure

```
kodepos-api/
├── src/                    # Source code
│   ├── index.ts           # Main application entry point
│   ├── types/             # TypeScript type definitions
│   └── services/          # Business logic services
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── migrations/            # Database migrations
└── .github/workflows/     # CI/CD configurations
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### Writing Tests

- Use Vitest for testing
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests focused and independent

## 📚 Documentation

### API Documentation

- Document all public API endpoints
- Include request/response examples
- Document error responses
- Provide usage examples in multiple languages

### Code Documentation

- Add JSDoc comments to all public functions
- Include parameter types and return types
- Add examples for complex functions
- Document edge cases and limitations

## 🚀 Deployment

### Development

```bash
# Start development server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Deploy to staging
npm run deploy:staging
```

## 🔄 Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a Git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. Create a GitHub Release with release notes

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Your code follows the project's coding standards
- [ ] You have written tests for new functionality
- [ ] All tests pass
- [ ] You have updated documentation if needed
- [ ] Your commit messages follow conventional commit format

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of the code completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

## 🤖 Development Tools

### Recommended VS Code Extensions

- TypeScript Hero
- ESLint
- Prettier
- GitLens
- Thunder Client (for API testing)

### Useful Commands

```bash
# Format code
npm run format

# Check code style
npm run lint

# Type checking
npm run type-check

# Generate API documentation
npm run docs:generate

# Run local database
npm run db:local
```

## 🆘 Getting Help

- Create an issue for questions or problems
- Check existing issues for solutions
- Join our discussions for general questions
- Review the documentation for common issues

## 📜 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment for all contributors.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contribution report

Thank you for contributing to Kodepos API Indonesia! Your contributions help make Indonesian postal code data accessible to developers worldwide.