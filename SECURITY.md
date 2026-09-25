# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

We take the security of **ParallelCoder** seriously. If you believe you have found a security vulnerability in this project, please report it to us responsibly.

### Disclosure Process

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Email your findings and detailed reproduction steps to [bhaskar.kumar@example.com](mailto:bhaskar.kumar@example.com) or submit a private security report via GitHub's Security Advisories feature.
3. Include the following details in your report:
   - Type of issue (e.g., SQL injection, XSS, authentication bypass, RCE)
   - Detailed step-by-step instructions to reproduce the issue
   - Any proof-of-concept code or HTTP requests
   - Impact of the issue and potential mitigation strategy
4. You will receive an acknowledgment within 48 hours, followed by updates on our resolution progress.

## Security Best Practices in ParallelCoder

- **Sandboxed Execution:** Code execution runs inside isolated Docker containers with non-root user execution, memory limits, CPU caps, and network isolation.
- **Authentication & Sessions:** JWT token authentication stored in HTTP-only secure cookies with strict CORS and rate limiting controls.
- **Data Protection:** Database connection credentials and secrets are managed via environment variables and never checked into source control.
