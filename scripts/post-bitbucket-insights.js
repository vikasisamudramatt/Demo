/*
 Posts a Bitbucket Server/Data Center Code Insights report and annotations
 based on ESLint Checkstyle XML.
 Env vars required:
  - BB_BASE_URL, BB_PROJECT_KEY, BB_REPO_SLUG, BB_USERNAME, BB_TOKEN
  - COMMIT_SHA (commit hash to attach insights to)
  - INSIGHTS_KEY (identifier, e.g. 'eslint')
  - INSIGHTS_TITLE (optional, default 'ESLint')
*/
const fs = require('fs');
const https = require('https');
const { URL } = require('url');

function parseCheckstyle(xml) {
  const files = [...xml.matchAll(/<file name=\"([^\"]+)\">([\s\S]*?)<\/file>/g)];
  const issues = [];
  for (const f of files) {
    const file = f[1];
    const body = f[2];
    const errors = [...body.matchAll(/<error line=\"(\d+)\" severity=\"([^\"]+)\" message=\"([^\"]+)[\s\S]*?\/>/g)];
    for (const e of errors) {
      issues.push({ file, line: Number(e[1]), severity: e[2], message: e[3] });
    }
  }
  return issues;
}

function severityMap(sev) {
  const s = (sev || '').toLowerCase();
  if (s === 'error') return 'HIGH';
  if (s === 'warning' || s === 'warn') return 'MEDIUM';
  return 'LOW';
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

async function main() {
  const {
    BB_BASE_URL,
    BB_PROJECT_KEY,
    BB_REPO_SLUG,
    BB_USERNAME,
    BB_TOKEN,
    COMMIT_SHA,
    INSIGHTS_KEY = 'eslint',
    INSIGHTS_TITLE = 'ESLint',
  } = process.env;

  if (!BB_BASE_URL || !BB_PROJECT_KEY || !BB_REPO_SLUG || !BB_USERNAME || !BB_TOKEN || !COMMIT_SHA) {
    console.log('Missing required env vars for Bitbucket Insights. Skipping.');
    process.exit(0);
  }

  const checkstylePath = 'reports/eslint-checkstyle.xml';
  if (!fs.existsSync(checkstylePath)) {
    console.log('No checkstyle XML found; skipping insights.');
    process.exit(0);
  }
  const xml = fs.readFileSync(checkstylePath, 'utf8');
  const issues = parseCheckstyle(xml);

  const report = {
    title: INSIGHTS_TITLE,
    details: issues.length ? `Found ${issues.length} ESLint issue(s).` : 'No ESLint issues.',
    link: '',
    reporter: 'GitHub Actions',
    result: issues.length ? 'FAIL' : 'PASS',
  };

  const base = BB_BASE_URL.replace(/\/$/, '');
  const auth = `${BB_USERNAME}:${BB_TOKEN}`;
  const reportUrl = `${base}/rest/insights/1.0/projects/${encodeURIComponent(BB_PROJECT_KEY)}/repos/${encodeURIComponent(BB_REPO_SLUG)}/commits/${encodeURIComponent(COMMIT_SHA)}/reports/${encodeURIComponent(INSIGHTS_KEY)}`;

  try {
    await request('PUT', reportUrl, auth, report);
    console.log('Posted Insights report');
  } catch (e) {
    console.error('Failed to post Insights report:', e.message);
    process.exit(0);
  }

  const annUrl = `${reportUrl}/annotations`;
  for (let i = 0; i < issues.length; i++) {
    const it = issues[i];
    const annotation = {
      externalId: `${INSIGHTS_KEY}-${i + 1}`,
      message: it.message,
      path: it.file.replace(/^\.?\/?/, ''),
      line: it.line,
      severity: severityMap(it.severity),
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
