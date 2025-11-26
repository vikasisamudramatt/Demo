# Demo
AI agent created application

## Automatic Code Review

This repository includes an automatic code review system that runs on all pull requests. The system analyzes code changes and provides feedback on common issues.

### Features

The automated code review checks for:

- **Debug statements** - Detects `console.log`, `print()`, `System.out.println()`, etc.
- **TODO/FIXME comments** - Identifies technical debt markers
- **Potential secrets** - Flags possible sensitive information like passwords, API keys, tokens
- **Focused tests** - Detects `.only()`, `fdescribe`, `fit()` that may skip other tests

### How It Works

1. When a pull request is opened or updated, the workflow automatically triggers
2. The system analyzes all changed code files
3. Review comments are posted directly on the pull request
4. Developers can review the feedback and make necessary changes

### Supported Languages

The code review currently supports:
- JavaScript/TypeScript (`.js`, `.ts`, `.jsx`, `.tsx`)
- Python (`.py`)
- Java (`.java`)
- Go (`.go`)
- Ruby (`.rb`)
- PHP (`.php`)
- C# (`.cs`)
- C/C++ (`.c`, `.cpp`, `.h`)

### Workflow Configuration

The automatic code review workflow is defined in `.github/workflows/code-review.yml` and runs on:
- Pull request opened
- Pull request synchronized (new commits)
- Pull request reopened

To customize the review patterns or add new checks, edit the workflow file.
