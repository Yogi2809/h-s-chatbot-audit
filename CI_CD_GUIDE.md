# GitHub Actions CI/CD Pipeline

## Overview

This project uses GitHub Actions for automated testing, building, and deployment.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers on:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Steps:**
1. **Test & Build** (runs on Node 18 & 20)
   - Install dependencies
   - Type checking with TypeScript
   - Linting with ESLint
   - Run tests
   - Build Next.js application
   - Test audit API endpoint

2. **Deploy to Vercel** (only on main branch after successful build)
   - Deploys to production URL
   - Auto-comments on PRs with deployment status

### 2. Code Quality (`quality.yml`)

**Triggers on:**
- Pull requests to `main` or `develop`

**Checks:**
- TypeScript strict mode compliance
- ESLint rules
- Build output size
- Comments results on PR

## Setup Instructions

### 1. Connect Vercel to GitHub (Already Done ✓)

Your repository is already connected to Vercel. Deployments happen automatically.

### 2. Set Vercel Secrets (If needed)

In your GitHub repository settings, add these secrets:

```
Settings → Secrets and variables → Actions
```

**Required secrets:**
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - From Vercel project settings
- `VERCEL_PROJECT_ID` - From Vercel project settings

**Optional secrets:**
- `DATABASE_URL` - For database connections
- `API_KEY` - For external APIs

### 3. Branch Protection Rules (Recommended)

Add branch protection to ensure only tested code merges:

```
Settings → Branches → Add rule
  - Branch name: main
  - Require status checks to pass before merging
  - Select:
    ✓ test-and-build
    ✓ quality-checks
```

## Workflow Status

View live status at:
```
https://github.com/Yogi2809/h-s-chatbot-audit/actions
```

## Local Testing

Test before pushing:

```bash
# Run same checks as CI/CD
npm run type-check
npm run lint
npm test
npm run build

# Test API endpoint
npm run dev &
curl -X POST http://localhost:3000/api/audit \
  -F "file=@tests/sample.csv" | jq '.'
pkill -f "npm run dev"
```

## Troubleshooting

### Deployment Failed
- Check GitHub Actions logs: https://github.com/Yogi2809/h-s-chatbot-audit/actions
- Check Vercel deployment logs: https://vercel.com/yogeshmishra080202-2206s-projects/h-s-chatbot-audit
- Ensure all secrets are set correctly

### Type Errors in CI
Run locally:
```bash
npm run type-check
```

### Lint Errors
Run locally:
```bash
npm run lint
```

## Next Steps

1. ✅ Create GitHub Actions workflows
2. ⏳ Set up Vercel secrets (if needed)
3. ⏳ Configure branch protection rules
4. ✅ Auto-deploy on every push to main

## Quick Links

- **GitHub Actions**: https://github.com/Yogi2809/h-s-chatbot-audit/actions
- **Vercel Dashboard**: https://vercel.com/yogeshmishra080202-2206s-projects/h-s-chatbot-audit
- **Live App**: Check Vercel dashboard for deployment URL
