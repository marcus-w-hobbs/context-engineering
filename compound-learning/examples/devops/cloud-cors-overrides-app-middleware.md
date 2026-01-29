---
title: Cloud Platform CORS Policy Overrides Application Middleware
category: devops
tags: [cors, cloud, preflight, patch, 401, azure, aws, gcp]
date: 2026-01-23
---

# Cloud Platform CORS Policy Overrides Application Middleware

## Symptom

- PATCH/PUT/DELETE requests fail with CORS error in browser console
- Error: `Method PATCH is not allowed in Access-Control-Allow-Methods`
- Application code has `allow_methods=["*"]` but methods are still blocked
- GET and POST work while other methods fail

```
Access to fetch at 'https://api.example.com/resource' from origin
'https://app.example.com' has been blocked by CORS policy: Method PATCH is
not allowed in Access-Control-Allow-Methods in preflight response.
```

## Root Cause

Cloud platforms (Azure Container Apps, AWS API Gateway, GCP Cloud Run) have their own CORS configurations that **take precedence** over application-level CORS middleware.

When the platform-level CORS policy doesn't explicitly allow a method, it blocks requests regardless of what your application code permits.

Common culprit: platform CORS config has `allowedMethods: null` or only `["GET", "POST"]`, blocking PATCH/PUT/DELETE.

## Solution

Update the platform's CORS configuration to explicitly allow all needed methods.

**Diagnosis:**
```bash
# Check current platform CORS config (example for Azure)
az containerapp show -n <app> -g <rg> --query "properties.configuration.ingress.corsPolicy"
```

**Fix:**
Configure at the platform level to allow:
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: * (or specific headers you use)
- Origins: Your frontend domain(s) + localhost for dev
- Credentials: true (if using cookies/auth headers)

**Verify:**
```bash
curl -I -X OPTIONS https://api.example.com/resource \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: PATCH"
```

Should return `Access-Control-Allow-Methods` including PATCH.

## Prevention

1. **Infrastructure as Code**: Define CORS policy in Terraform/Bicep/CloudFormation, not just app code
2. **Deployment checklist**: Verify CORS config after any infrastructure changes
3. **Test preflight requests**: Add OPTIONS request tests to CI/CD
4. **Document the split**: Note in CLAUDE.md that CORS is configured at both app AND platform level

## Related

- Application-level CORS middleware is still useful for local development
- Some platforms let you disable platform CORS entirely and defer to the app
- When debugging CORS: always check BOTH layers
