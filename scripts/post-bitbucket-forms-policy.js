/*
 Posts a Bitbucket Server/Data Center Code Insights report and annotations
 for the "Reactive Forms only" policy. Detects template-driven usage.
 Env vars required:
  - BB_BASE_URL, BB_PROJECT_KEY, BB_REPO_SLUG, BB_USERNAME, BB_TOKEN
  - COMMIT_SHA (commit hash to attach insights to)
  - INSIGHTS_KEY (identifier, e.g. 'forms-policy')
  - INSIGHTS_TITLE (optional, default 'Forms Policy')
*/
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

function detectTemplateDriven(root = 'src') {
  const files = walk(root, []).filter((f) => /\.(ts|html)$/.test(f));
  const violations = [];
  const htmlPatterns = [
    { re: /\[\(\s*ngModel\s*\)\]/g, msg: 'Two-way binding with ngModel' },
    { re: /\bngModel\b/g, msg: 'ngModel directive' },
    { re: /\bngForm\b/g, msg: 'ngForm directive' },
  ];
  const tsPatterns = [
    { re: /\bFormsModule\b/g, msg: 'FormsModule import' },
    { re: /\bNgModel\b/g, msg: 'NgModel import' },
    { re: /\bNgForm\b/g, msg: 'NgForm import' },
  ];

  function matchesWithLines(content, re) {
    const out = [];
    let m;
    while ((m = re.exec(content))) {
      const idx = m.index;
      const line = content.slice(0, idx).split(/\r?\n/).length;
      out.push({ line });
      if (!re.global) break;
    }
    return out;
  }

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (f.endsWith('.html')) {
      for (const p of htmlPatterns) {
        const hits = matchesWithLines(content, new RegExp(p.re));
        for (const h of hits) {
          violations.push({ file: f, line: h.line, message: `Template-driven usage: ${p.msg}` });
        }
      }
    } else if (f.endsWith('.ts')) {
      for (const p of tsPatterns) {
        const hits = matchesWithLines(content, new RegExp(p.re));
        for (const h of hits) {
          violations.push({ file: f, line: h.line, message: `Template-driven usage: ${p.msg}` });
        }
      }
    }
  }
  return violations;
}

function request(method, urlStr, auth, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
      },
    };
    if (auth) {
      opts.headers['Authorization'] = 'Basic ' + Buffer.from(auth).toString('base64');
    }
    const req = (u.protocol === 'https:' ? https : require('http')).request(opts, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve({ status: res.statusCode, body: buf });
        else reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function severity() {
  return 'HIGH';
}

async function main() {
  const {
    BB_BASE_URL,
    BB_PROJECT_KEY,
    BB_REPO_SLUG,
    BB_USERNAME,
    BB_TOKEN,
    COMMIT_SHA,
    INSIGHTS_KEY = 'forms-policy',
    INSIGHTS_TITLE = 'Forms Policy',
  } = process.env;

  if (!BB_BASE_URL || !BB_PROJECT_KEY || !BB_REPO_SLUG || !BB_USERNAME || !BB_TOKEN || !COMMIT_SHA) {
    console.log('Missing required env vars for Bitbucket Insights. Skipping.');
    process.exit(0);
  }

  const findings = detectTemplateDriven('src');
  const report = {
    title: INSIGHTS_TITLE,
    details: findings.length
      ? `Detected ${findings.length} template-driven form usage(s). Use Reactive Forms instead.`
      : 'No template-driven forms detected. ✅',
    link: '',
    reporter: 'GitHub Actions',
    result: findings.length ? 'FAIL' : 'PASS',
  };

  const base = BB_BASE_URL.replace(/\/$/, '');
  const auth = `${BB_USERNAME}:${BB_TOKEN}`;
  const reportUrl = `${base}/rest/insights/1.0/projects/${encodeURIComponent(BB_PROJECT_KEY)}/repos/${encodeURIComponent(
    BB_REPO_SLUG
  )}/commits/${encodeURIComponent(COMMIT_SHA)}/reports/${encodeURIComponent(INSIGHTS_KEY)}`;

  try {
    await request('PUT', reportUrl, auth, report);
    console.log('Posted Forms Policy Insights report');
  } catch (e) {
    console.error('Failed to post Forms Policy report:', e.message);
    process.exit(0);
  }

  const annUrl = `${reportUrl}/annotations`;
  for (let i = 0; i < findings.length; i++) {
    const it = findings[i];
    const annotation = {
      externalId: `${INSIGHTS_KEY}-${i + 1}`,
      message: it.message,
      path: it.file.replace(/^\.?\/?/, ''),
      line: it.line || 1,
      severity: severity(),
    };
    try {
      await request('POST', annUrl, auth, annotation);
      console.log(`Posted annotation ${annotation.externalId}`);
    } catch (e) {
      console.error(`Failed to post annotation for ${it.file}:${it.line} - ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(0);
});
