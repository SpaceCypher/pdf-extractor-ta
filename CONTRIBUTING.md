# Contributing to PDF Extraction Playground

We're excited that you're interested in contributing to PDF Extraction Playground! This document outlines the process for contributing to this project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended for optimal PDF.js performance)
- Python 3.11+ (for backend development)
- Git
- Modal.com account (for backend deployment)

### Local Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/pdf-extraction-playground.git
   cd pdf-extraction-playground
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Backend Setup** (optional)
   ```bash
   cd backend
   pip install -r requirements.txt
   # Configure Modal deployment if needed
   ```

## 🛠️ Development Guidelines

### Code Style
- **Frontend**: TypeScript with strict mode, ESLint + Prettier
- **Backend**: Python with type hints, follow PEP 8
- **Commits**: Use conventional commit format
- **Testing**: Write tests for new features

### Conventional Commits
Use the following format for commit messages:
```
<type>(<scope>): <description>

<body>

<footer>
```

Examples:
- `feat(extraction): add new AI model support`
- `fix(ui): resolve PDF viewer zoom issue`
- `docs(api): update endpoint documentation`
- `test(backend): add extraction pipeline tests`

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## 📝 Types of Contributions

### 🐛 Bug Reports
When filing a bug report, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment information
- Screenshots if applicable

### ✨ Feature Requests
For feature requests, please provide:
- Clear description of the feature
- Use case and motivation
- Possible implementation approach
- Any relevant mockups or examples

### 🔧 Code Contributions

#### Pull Request Process
1. **Create a Fork** of the repository
2. **Create a Branch** from `main` for your changes
3. **Make Changes** following our coding standards
4. **Write Tests** for new functionality
5. **Update Documentation** as needed
6. **Submit Pull Request** with clear description

#### Pull Request Requirements
- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated if needed
- [ ] PR description clearly explains changes
- [ ] Screenshots included for UI changes

### 📚 Documentation
Help improve our documentation:
- Fix typos or unclear explanations
- Add examples and use cases
- Improve API documentation
- Create tutorials or guides

## 🏗️ Architecture Overview

### Frontend (Next.js)
```
src/
├── app/                # Next.js App Router pages
├── components/         # React components
├── lib/               # Utilities and configuration
└── styles/            # Global styles
```

### Backend (FastAPI + Modal)
```
backend/
├── modal_app.py       # Main Modal application
├── models/            # AI model integrations
└── requirements.txt   # Python dependencies
```

### Key Technologies
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Modal.com, PyMuPDF
- **AI Models**: Docling, Surya, MinerU

## 🧪 Testing

### Frontend Testing
```bash
npm test              # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Manual Testing Checklist
- [ ] PDF upload works with various file sizes
- [ ] All AI models process documents correctly
- [ ] Visual annotations display properly
- [ ] Export functionality works
- [ ] Responsive design on mobile/tablet
- [ ] Dark/light theme switching

## 🔍 Code Review Process

All contributions go through code review:
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Peer Review**: Core maintainers review code for quality
3. **Feedback**: Address any comments or suggestions
4. **Approval**: Once approved, changes are merged

### Review Criteria
- Code quality and maintainability
- Performance implications
- Security considerations
- Documentation completeness
- Test coverage

## 🚀 Release Process

Releases follow semantic versioning (SemVer):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully

### Be Collaborative
- Help newcomers get started
- Share knowledge and best practices
- Provide helpful feedback on issues and PRs

### Be Professional
- Stay on topic in discussions
- Provide clear and concise communication
- Follow through on commitments

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and ideas
- **Discord**: Join our community for real-time chat
- **Email**: contact@pdf-extraction-playground.com

## 🏆 Recognition

Contributors are recognized through:
- **GitHub Contributors** section in README
- **Release Notes** acknowledgment
- **Community Spotlight** in discussions
- **Maintainer Invitation** for consistent contributors

## 📄 License

By contributing to PDF Extraction Playground, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making PDF extraction better for everyone! 🎉