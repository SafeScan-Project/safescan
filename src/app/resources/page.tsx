export default function ResourcesPage() {
  const commonSecurityIssues = [
    {
      issue: 'Broken Access Control',
      fix: 'Enforce server-side authorization checks for every protected route and action. Never rely only on hidden UI elements.',
    },
    {
      issue: 'Weak Password Policies',
      fix: 'Require strong passwords, rate-limit login attempts, and add MFA where possible.',
    },
    {
      issue: 'Injection (SQL/NoSQL/Command)',
      fix: 'Use parameterized queries, strict input validation, and avoid building queries/commands with raw user input.',
    },
    {
      issue: 'Cross-Site Scripting (XSS)',
      fix: 'Escape untrusted output, sanitize rich text, and deploy a strong Content Security Policy (CSP).',
    },
    {
      issue: 'Security Misconfiguration',
      fix: 'Disable debug mode in production, remove default credentials, and keep secure headers enabled.',
    },
    {
      issue: 'Using Vulnerable Components',
      fix: 'Keep dependencies updated, monitor advisories, and regularly run dependency audits.',
    },
    {
      issue: 'Sensitive Data Exposure',
      fix: 'Use HTTPS everywhere, encrypt sensitive data at rest, and avoid logging secrets or personal data.',
    },
    {
      issue: 'Cross-Site Request Forgery (CSRF)',
      fix: 'Use CSRF tokens for state-changing requests and set cookies with SameSite and Secure flags.',
    },
    {
      issue: 'Insufficient Logging and Monitoring',
      fix: 'Log authentication and high-risk actions, alert on suspicious events, and review logs regularly.',
    },
    {
      issue: 'Server-Side Request Forgery (SSRF)',
      fix: 'Validate/allowlist outbound URLs, block internal network ranges, and use strict egress controls.',
    },
  ];

  return (
    <div className="resources-page max-w-2xl mx-auto mt-10 p-6 border rounded bg-white dark:bg-zinc-900">
      <h1 className="resources-title text-2xl font-bold mb-4">Learning Resources</h1>
      <p className="resources-intro mb-4">Explore these trusted resources to deepen your understanding of web security concepts:</p>
      <ul className="resources-list list-disc pl-6 space-y-2">
        <li className="resources-item">
          <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="resources-link text-blue-600 underline">OWASP Top Ten</a> – The most critical security risks to web applications.
        </li>
        <li className="resources-item">
          <a href="https://developer.mozilla.org/en-US/docs/Web/Security" target="_blank" rel="noopener noreferrer" className="resources-link text-blue-600 underline">MDN Web Docs: Security</a> – Practical guides and explanations for web developers.
        </li>
        <li className="resources-item">
          <a href="https://portswigger.net/web-security" target="_blank" rel="noopener noreferrer" className="resources-link text-blue-600 underline">PortSwigger Web Security Academy</a> – Free interactive labs and tutorials.
        </li>
        <li className="resources-item">
          <a href="https://www.freecodecamp.org/news/tag/security/" target="_blank" rel="noopener noreferrer" className="resources-link text-blue-600 underline">freeCodeCamp Security Articles</a> – Beginner-friendly articles on security topics.
        </li>
        <li className="resources-item">
          <a href="https://www.hacksplaining.com/" target="_blank" rel="noopener noreferrer" className="resources-link text-blue-600 underline">Hacksplaining</a> – Interactive lessons on common vulnerabilities.
        </li>
      </ul>

      <h2 className="resources-title text-xl font-bold mt-8 mb-3">10 Common Security Issues and How to Improve Them</h2>
      <ol className="resources-list list-decimal pl-6 space-y-3">
        {commonSecurityIssues.map((entry) => (
          <li key={entry.issue} className="resources-item">
            <span className="font-semibold">{entry.issue}: </span>
            <span>{entry.fix}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
