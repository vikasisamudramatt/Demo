# Angular AI Agent PR Review Demo

This is a minimal Angular app to demo how an AI agent can assist with PR reviews.

## Prerequisites
- Node.js 18+ (preferably 20)
- npm 9+

## Setup (Windows PowerShell)

```powershell
# Install dependencies
npm install

# Start the dev server
npm start

# Run tests
npm test

# Lint
npm run lint

# Build
npm run build
```

## App structure
- `src/main.ts`: Bootstraps the app with standalone components and routes.
- `src/app/app.component.ts`: Root layout and router outlet.
- `src/app/home.component.ts`: Simple welcome page.
- `src/app/features/pr-review-demo`: Feature with a form, list, and service using an in-memory API.

## Demo idea
- Open a PR that changes the `ReviewService` or the `PrReviewDemoComponent`.
- Have the AI agent review the PR for:
  - Code style and ESLint rules
  - Accessibility (labels, ARIA)
  - Async patterns and error handling
  - Tests coverage

## CI
- GitHub Actions workflow: install, lint, build, test.
 
## Bitbucket PR Review (mirror)
If you mirror this repository to Bitbucket, automatic PR checks can run via Bitbucket Pipelines.

- `bitbucket-pipelines.yml` runs on pull requests and on `main` branch pushes:
  - `npm ci`
  - ESLint generates Checkstyle XML and Bitbucket Pipe annotates PRs
  - `npm run build -- --configuration=production`
  - `npm test -- --watch=false`

Setup steps:
- Ensure your mirrored Bitbucket repo has Pipelines enabled.
- Push this file (`bitbucket-pipelines.yml`) to the mirror (or to GitHub and let the mirror sync).
- Open a Pull Request in Bitbucket; the pipeline will execute and surface results in the PR.

Notes:
 - Inline annotations: the pipeline uses `npx eslint --format checkstyle -o reports/eslint-checkstyle.xml` and the `atlassian/checkstyle-report` pipe to publish annotations to the PR.
 - If you have custom ESLint config paths or want to limit scope, adjust the command accordingly (e.g., `npx eslint src --ext .ts`).
