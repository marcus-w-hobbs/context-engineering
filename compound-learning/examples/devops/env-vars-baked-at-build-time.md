---
title: Frontend Environment Variables Baked at Build Time
category: devops
tags: [vite, env, environment, build, runtime, config]
date: 2026-01-24
---

# Frontend Environment Variables Baked at Build Time

## Symptom

- Deployed frontend uses wrong API URL or config values
- Environment variables work in local dev but not in production
- Changing env vars in deployment platform doesn't affect the running app
- Build logs show correct values, but runtime behavior is wrong

```
// Expected: https://api.prod.example.com
// Actual:   http://localhost:8000
```

## Root Cause

Build tools like Vite, Next.js, and Create React App **inline environment variables at build time**. The values are baked into the JavaScript bundle during `npm run build`.

```typescript
// This gets replaced at BUILD time, not runtime
const apiUrl = import.meta.env.VITE_API_URL;

// After build, the bundle literally contains:
const apiUrl = "http://localhost:8000";  // Whatever was set during build
```

Changing environment variables in your deployment platform (Vercel, Azure, AWS) doesn't help because those are runtime variables—but the frontend has no runtime.

## Solution

### Option 1: Build per environment
Build separately for each environment with correct env vars:
```bash
# Build for production
VITE_API_URL=https://api.prod.example.com npm run build

# Build for staging  
VITE_API_URL=https://api.staging.example.com npm run build
```

### Option 2: Runtime config endpoint
Serve config from the backend:
```typescript
// At app startup
const config = await fetch('/api/config').then(r => r.json());
// Use config.apiUrl instead of import.meta.env
```

### Option 3: Window injection
Inject config at serve time:
```html
<!-- index.html served by backend/CDN -->
<script>
  window.__CONFIG__ = {
    apiUrl: "{{API_URL}}",  // Templated by server
  };
</script>
```

```typescript
// In app code
const apiUrl = window.__CONFIG__.apiUrl;
```

## Prevention

1. **Document build-time vs runtime** in CLAUDE.md:
   ```markdown
   ## Environment Variables
   
   Frontend env vars are BUILD-TIME only.
   - VITE_* variables are baked into the bundle during `npm run build`
   - Changing deployment env vars does NOT affect the running frontend
   - Must rebuild to change any frontend config
   ```

2. **CI/CD per environment**: Configure pipelines to build with environment-specific vars

3. **Avoid env vars for things that change**: If config might differ between deploys of the same build, use runtime config instead

4. **Build verification**: Add a health endpoint that reports the baked config:
   ```typescript
   // /health or /__config (dev only)
   return { apiUrl: import.meta.env.VITE_API_URL, buildTime: import.meta.env.VITE_BUILD_TIME };
   ```

## Related

- Backend env vars ARE runtime—this only affects frontends
- Server-side rendered apps (Next.js SSR) can use runtime env vars for server code
- Static site generators have the same build-time limitation
