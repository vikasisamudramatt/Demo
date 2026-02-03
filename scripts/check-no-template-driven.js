const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

function detectViolations(root = 'src') {
  const files = walk(root, []).filter(f => /\.(ts|html)$/.test(f));
  const violations = [];
  const htmlPatterns = [
    /\[\(\s*ngModel\s*\)\]/, // two-way binding
    /\bngModel\b/,               // presence of ngModel
    /\bngForm\b/,                // template form
  ];
  const tsPatterns = [
    /\bFormsModule\b/,           // module import for template-driven
    /\bNgModel\b/,               // directive import
    /\bNgForm\b/                 // directive import
  ];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (f.endsWith('.html')) {
      for (const re of htmlPatterns) {
        if (re.test(content)) violations.push({ file: f, reason: `Template-driven usage detected: ${re}` });
      }
    } else if (f.endsWith('.ts')) {
      for (const re of tsPatterns) {
        if (re.test(content)) violations.push({ file: f, reason: `Template-driven import/usage detected: ${re}` });
      }
    }
  }
  return violations;
}

function postGithubComment(body) {
  const repo = process.env.GITHUB_REPOSITORY; // owner/repo
  const token = process.env.GITHUB_TOKEN;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!repo || !token || !eventPath) return false;
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const prNumber = event.pull_request?.number;
  if (!prNumber) return false;
  const url = `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`;
  const payload = JSON.stringify({ body });
  const { execSync } = require('child_process');
  try {
    execSync(
      `curl -s -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -X POST ${url} -d '${payload.replace(/'/g, "'\''")}'`,
      { stdio: 'inherit' }
    );
    return true;
  } catch {
    return false;
  }
}

(function main() {
  const violations = detectViolations('src');
  if (violations.length === 0) {
    console.log('No template-driven forms detected.');
    process.exit(0);
  }
  let md = '**Policy Violation: Template-Driven Forms Detected**\n';
  md += 'This project mandates Reactive Forms; please replace template-driven usage.\n\n';
  for (const v of violations) md += `- ${v.file}: ${v.reason}\n`;
  console.log(md);
  postGithubComment(md);
  process.exit(1);
})();
