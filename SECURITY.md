# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |
| 0.0.x   | :x:                |

## Reporting a Vulnerability

Jika Anda menemukan security vulnerability di Omakase, please report it privately.

### How to Report

1. **GitHub Security Advisories**: https://github.com/miruamel/omakase/security/advisories/new
2. **Email**: miruamelizabethelrathvonalwood-eng@users.noreply.github.com

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

- Initial response: within 48 hours
- Status update: within 7 days
- Fix timeline: depends on severity

## Security Features

Omakase includes several security features:

- **Bash tool**: Dangerous command detection (`rm -rf`, `sudo`, `dd`, `mkfs`)
- **FileWrite tool**: Blocks writes to `/etc/`, `/proc/`, `/sys/`
- **Plugin manager**: Source format validation
- **API keys**: Read from environment variables, never hardcoded

## Best Practices

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Keep dependencies updated
- Review plugin source before installation
