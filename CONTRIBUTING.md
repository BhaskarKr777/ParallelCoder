# Contributing to ParallelCoder

Thank you for your interest in contributing to **ParallelCoder**! We welcome bug reports, feature requests, documentation updates, and code contributions.

---

## Code of Conduct

This project enforces a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### 1. Reporting Bugs
Before creating a bug report, please check the [existing issues](https://github.com/BhaskarKr777/ParallelCoder/issues).
If you find a new bug, please open an issue using the **Bug Report** template and include:
- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots or console logs if applicable

### 2. Suggesting Features
Enhancement suggestions are tracked as GitHub issues. When creating a feature request, please use the **Feature Request** template and describe:
- The problem your feature solves
- The proposed solution and design
- Any alternative solutions considered

### 3. Pull Requests
1. **Fork the Repository** and clone your fork locally.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Set Up Local Environment**:
   ```bash
   npm install
   npm install --prefix Backend
   npm install --prefix Frontend
   ```
4. **Make Your Changes** following code standards.
5. **Run Tests and Linter**:
   ```bash
   npm test
   npm run lint --prefix Frontend
   ```
6. **Commit Your Changes** with clear commit messages:
   ```bash
   git commit -m "feat(auth): add OAuth2 provider support"
   ```
7. **Push to GitHub** and open a Pull Request against the `main` branch.

---

## Project Structure

```
ParallelCoder/
├── Backend/             # Express.js, Socket.IO, Yjs & Prisma backend
│   ├── src/             # API routes, middleware, models
│   ├── tests/           # Integration & unit test suite
│   └── websocket/       # Real-time collaboration handlers
├── Frontend/            # React + Vite + Tailwind CSS frontend
│   ├── src/             # UI components, pages, state stores
├── tests/               # Core root test suite
├── .github/             # GitHub Actions CI/CD & templates
└── docker-compose.yml   # Multi-container dev setup
```

---

## Code Style & Standards

- **JavaScript Standard**: ES Modules (`import`/`export`), async/await.
- **Formatting**: 2 spaces indentation, double or single quotes consistently formatted.
- **Testing**: Every new feature or bugfix should include corresponding unit or integration tests.

Thank you for contributing!
