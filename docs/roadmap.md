# Omakase Roadmap

Planned features and improvements for Omakase.

## v0.2.0 - Current (June 2026)

✅ **Provider Health System**
- Circuit breaker pattern
- Automatic failover
- Health check polling
- Real-time status UI

✅ **Production Readiness**
- 290+ tests
- 7 CI/CD workflows
- Comprehensive documentation
- Community files

## v0.3.0 - Next Release (July 2026)

### Features
- [ ] **Persistent Task Storage** - Chronos tasks survive restarts
- [ ] **Plugin Marketplace** - Discover and install plugins from UI
- [ ] **IDE Integration** - VS Code extension
- [ ] **Voice Input** - Voice-to-text for hands-free coding
- [ ] **Conversation Export** - Save sessions as markdown

### Improvements
- [ ] **Faster Startup** - Target <100ms cold start
- [ ] **Better Error Messages** - User-friendly error explanations
- [ ] **Config Validation** - Real-time config file validation
- [ ] **Memory Optimization** - Reduce idle memory to <100MB

### Testing
- [ ] **E2E Tests** - Full integration test suite
- [ ] **Performance Tests** - Automated regression detection
- [ ] **Security Tests** - Vulnerability scanning in CI

## v0.4.0 - Q3 2026

### Features
- [ ] **Multi-Session Support** - Run multiple sessions simultaneously
- [ ] **Agent Collaboration** - Agents can communicate and share context
- [ ] **Custom Agent Roles** - Define your own agent personas
- [ ] **Plugin Sandbox** - Security isolation for untrusted plugins
- [ ] **Web UI** - Browser-based interface alternative to CLI

### Providers
- [ ] **Google Vertex AI** - Gemini models support
- [ ] **Azure OpenAI** - Enterprise Azure support
- [ ] **AWS Bedrock** - AWS native models
- [ ] **Groq** - Ultra-fast inference

### Platform
- [ ] **Windows Native** - Pre-built Windows binaries
- [ ] **Docker Image** - Containerized deployment
- [ ] **Homebrew Formula** - `brew install omakase`

## v0.5.0 - Q4 2026

### Features
- [ ] **Learning Mode** - Learn from user corrections
- [ ] **Team Collaboration** - Shared context across team members
- [ ] **Audit Trail** - Track all AI actions for compliance
- [ ] **Cost Budgets** - Set and enforce spending limits
- [ ] **Custom Tools** - Build and share custom tools

### AI Improvements
- [ ] **Better Context** - Larger context window support (100K+ tokens)
- [ ] **Fine-tuning** - Custom model fine-tuning on your codebase
- [ ] **Code Understanding** - Deeper semantic code analysis
- [ ] **Test Generation** - Auto-generate tests for new code

### Enterprise
- [ ] **SSO Integration** - SAML/OAuth for teams
- [ ] **Audit Logging** - Compliance-ready logging
- [ ] **On-Prem Deploy** - Air-gapped deployment option
- [ ] **SLA Support** - Paid support tiers

## v1.0.0 - 2027

### Milestones
- [ ] **Stable API** - API compatibility guarantee
- [ ] **1.0 Click Install** - Zero-config setup
- [ ] **99.9% Uptime** - Production SLA
- [ ] **10K+ Users** - Community milestone
- [ ] **100+ Plugins** - Plugin ecosystem

### Vision
Omakase becomes the default AI coding assistant for developers who want:
- **Control** - Full transparency and approval workflows
- **Flexibility** - Multi-provider, multi-agent, customizable
- **Privacy** - Local-first option, data ownership
- **Speed** - Fastest time-to-result
- **Reliability** - Production-grade fault tolerance

## Beyond v1.0

### Moonshots
- [ ] **Autonomous Development** - AI can build entire features from spec
- [ ] **Codebase Evolution** - Continuous refactoring and modernization
- [ ] **Cross-Language** - Seamless polyglot development
- [ ] **AR/VR Interface** - Immersive coding environment
- [ ] **Neural Interface** - Direct thought-to-code (kidding... mostly)

## How to Contribute

Pick any item and open a PR! We welcome contributions:

1. **Comment** on the feature you want to work on
2. **Create** a feature branch
3. **Implement** with tests
4. **Submit** PR with documentation

Small improvements are welcome too:
- Documentation fixes
- Test coverage
- Performance optimizations
- Bug fixes
- Feature requests

## Priority Scoring

Features are prioritized based on:

| Factor | Weight |
|--------|--------|
| User demand | 40% |
| Technical feasibility | 25% |
| Strategic value | 20% |
| Community contribution | 15% |

Want to influence priorities? 
- ⭐ Star the repo
- 💬 Request features in issues
- 🎨 Contribute PRs
- 📢 Share on social media

## Release Schedule

- **Minor releases** (0.X.0): Monthly
- **Patch releases** (0.0.X): Weekly
- **Major releases** (1.0.0): Q1 2027

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for release history.

---

**Last Updated:** June 25, 2026

**Questions?** Open an issue or join [Discussions](https://github.com/miruamel/omakase/discussions)
