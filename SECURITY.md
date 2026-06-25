# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

We take the security of Omakase seriously. If you believe you've found a security vulnerability, please follow these steps:

### What to Include

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** assessment
4. **Suggested fixes** (if any)

### Where to Report

**DO NOT** open a public issue for security vulnerabilities.

Instead, report to:
- Email: [your-email@example.com](mailto:your-email@example.com)
- GitHub Security Advisories: [Link pending setup]

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Fix Timeline:** Depends on severity (see below)

### Severity Levels

| Severity | Response Time | Fix Target |
|----------|---------------|------------|
| Critical | 24 hours      | 7 days     |
| High     | 48 hours      | 14 days    |
| Medium   | 5 days        | 30 days    |
| Low      | 10 days       | Next release |

### Disclosure Policy

We follow a **coordinated disclosure** approach:
1. Reporter submits vulnerability privately
2. We assess and develop a fix
3. Fix is released
4. Public disclosure after 30 days (or sooner by mutual agreement)

### Security Best Practices for Users

- Keep Omakase updated to the latest version
- Use API keys with minimal required permissions
- Review plugin code before installation
- Monitor logs for unusual activity
- Use environment variables for sensitive data

## Security Features

### Built-in Protections

- **Bash Tool:** Blocks dangerous commands (`rm -rf /`, `sudo`, `dd`, `mkfs`)
- **FileWrite:** Blocks writes to system directories (`/etc/`, `/proc/`, `/sys/`)
- **Plugin Validation:** Source format verification before execution
- **Provider Isolation:** Circuit breaker prevents cascading failures

### Future Improvements

- [ ] API key rotation support
- [ ] Audit logging for all tool executions
- [ ] Plugin sandboxing
- [ ] Rate limiting per provider
- [ ] Encrypted config storage

## Acknowledgments

We appreciate responsible disclosure and will credit researchers who report valid security issues (unless they prefer to remain anonymous).

---

**Last Updated:** 2026-06-25
